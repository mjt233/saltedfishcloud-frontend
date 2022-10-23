import { IdType } from '@/core/model'
import { FileSystemHandler } from '@/core/serivce/FileSystemHandler'
import API from '@/api'
import { ShareInfo } from '@/api/share'
import FileShareSuccessVue from '@/components/common/FileShare/FileShareSuccess.vue'
import FileShareCreateFormVue from '@/components/common/FileShare/Form/FileShareCreateForm.vue'
import { CommonForm } from '@/utils/FormUtils'
import SfcUtils from '@/utils/SfcUtils'
import { StringUtils } from '@/utils/StringUtils'
import { h } from 'vue'
import { VBtn } from 'vuetify/components'
import { FileInfo } from '../model'

export interface CreateShareFormConfig {
  /** 用户id */
  uid: IdType

  /** 被分享的文件所在路径 */
  path: string

  /** 被分享的文件名 */
  name: string
}

export namespace ShareService {
  /**
   * 取消分享
   * @param sid 待取消的分享id
   */
  export async function deleteShare(sid: number) {
    return await SfcUtils.request(API.share.deleteShare(sid))
  }
  
  /**
   * 获取分享链接地址
   */
  export function getShareLink(shareInfo: ShareInfo) {
    return StringUtils.appendPath(location.origin, '#/s', (shareInfo.id || '') + '', shareInfo.verification || '')
  }

  export async function getShareInfo(sid: number | string, vid: string, extractCode: string | null | undefined) {
    return (await SfcUtils.request(API.share.getBaseShareInfo(sid, vid, extractCode))).data.data
  }

  /**
   * 复制分享链接信息到剪切板
   * @param shareInfo 分享信息
   */
  export function copyShareLinkText(shareInfo: ShareInfo) {
    const link = getShareLink(shareInfo)
    
    let res = `呐呐呐(。・∀・)ノ，我用咸鱼云向你分享了文件：${shareInfo.name}\n链接：${link}`
    if (shareInfo.needExtractCode) res += `\n提取码：${shareInfo.extractCode}\n`
    SfcUtils.copyToClipboard(res)
    SfcUtils.snackbar('已复制分享信息到剪切板')
  }

  export function createShare(opt: CreateShareFormConfig) {
    const createDialog = SfcUtils.openComponentDialog(FileShareCreateFormVue, {
      props: {
        uid: opt.uid,
        path: opt.path,
        name: opt.name
      },
      title: '创建分享：' + opt.name,
      async onConfirm() {
        try {
          const res = await (createDialog.getComponentInstRef() as any as CommonForm).submit()
          if (res.success) {
            const shareInfo = res.data?.data.data as ShareInfo
            SfcUtils.sleep(100).then(() => {
              showSuccessDialog(shareInfo)
            })
            return true
          } else {
            return Promise.reject(res.err)
          }
        } catch (err) {
          throw err
        }
      }
    })
  }

  
  /**
   * 显示分享成功对话框
   * @param shareInfo 创建分享后获取的分享信息
   */
  export function showSuccessDialog(shareInfo :ShareInfo) {
    const link = StringUtils.appendPath(location.origin, '#/s', shareInfo.id + '', shareInfo.verification || '')
    const successDialog = SfcUtils.openComponentDialog(FileShareSuccessVue, {
      props: {
        data: shareInfo
      },
      title: '分享成功',
      showConfirm: false,
      showCancel: false,
      footer: () => [
        h(VBtn, { color: 'primary', onClick: () => {
          setTimeout(() => {
            SfcUtils.copyToClipboard(link)
            SfcUtils.snackbar('复制成功')
          }, 100)
        } }, () => '复制链接'),
        h(VBtn, { color: 'primary', onClick: () => { successDialog.close() } }, () => '取消')
      ]
    })
  }

  export class ShareFileSystemHandler implements FileSystemHandler {
    private shareInfo: ShareInfo
    constructor(shareInfo: ShareInfo) {
      this.shareInfo = shareInfo
    }
    getFileUrl(path: string, file: FileInfo) {
      return SfcUtils.getApiUrl(API.resource.getCommonResource({
        name: file.name,
        path: path,
        protocol: 'share',
        targetId: this.shareInfo.id,
        vid: this.shareInfo.verification,
        code: this.shareInfo.extractCode
      }))
    }
    async loadList(path: string): Promise<FileInfo[]> {
      const ret = await SfcUtils.request(API.share.browseDirShare(this.shareInfo.id + '', this.shareInfo.verification + '', this.shareInfo.extractCode || null, path))
      return ret.data.data[0].concat(ret.data.data[1])
    }
    
    getCustomThumbnailUrl(path: string, file: FileInfo) {
      return SfcUtils.getApiUrl(API.resource.getCommonResource({
        isThumbnail: true,
        name: file.name,
        path: path,
        protocol: 'share',
        targetId: this.shareInfo.id,
        vid: this.shareInfo.verification,
        code: this.shareInfo.extractCode
      }))
    }
    mkdir(path: string, name: string): Promise<null> {
      throw new Error('Method not implemented.')
    }
    deleteFile(path: string, names: string[]): Promise<number> {
      throw new Error('Method not implemented.')
    }
    uploadDirect(path: string, file: File): Promise<any> {
      throw new Error('Method not implemented.')
    }
    rename(path: string, oldName: string, newName: string): Promise<string> {
      throw new Error('Method not implemented.')
    }
    
  }
}