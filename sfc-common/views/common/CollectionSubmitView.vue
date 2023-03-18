<template>
  <base-view max-width="720px">
    <file-collection-submit-form
      v-if="!isFinish"
      ref="formRef"
      :cid="cid"
      :vid="vid"
      @submit="submit"
      @finish="isFinish = true"
    />
    <v-card v-else>
      <v-card-content>
        <v-row>
          <v-col style="max-width: 360px">
            <div class="text-h4 d-flex align-center justify-space-around">
              <v-icon color="success" icon="mdi-check-circle" />
              文件提交成功
            </div>
          </v-col>
        </v-row>
        
      </v-card-content>
      
    </v-card>
  </base-view>
  
</template>

<script setup lang="ts">
import FileCollectionSubmitForm from 'sfc-common/components/common/FileCollection/form/FileCollectionSubmitForm.vue'
import { context } from 'sfc-common/core/context'
import BaseView from 'sfc-common/components/common/BaseView.vue'
const formRef = ref() as Ref<CommonForm>
const {cid, vid} = context.routeInfo.value.curr?.params as any
const isFinish = ref(false)

const submit = () => {
  formRef.value.submit()
}
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType } from 'vue'
import { CommonForm } from 'sfc-common/utils/FormUtils'

export default defineComponent({
  name: 'CollectionSubmitView'
})
</script>