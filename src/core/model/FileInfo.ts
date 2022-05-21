export namespace FileTypeConstant {
  export const FILE = 2
  export const DIR = 1
}
export type FileType = 1|2
export interface FileInfo {
  uid: number,
  md5: string,
  node: string,
  name: string,
  size: number,
  dir: boolean
  type: FileType,
  createdAt: Date,
  suffix: string
}