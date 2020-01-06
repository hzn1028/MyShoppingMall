<template>
    <div>
      <div class="md-modal modal-msg md-modal-transition" v-bind:class="{'md-show':mdShow}">
        <div class="md-modal-inner">
          <div class="md-top">
            <button class="md-close" @click="closeModal">Close</button>
          </div>
          <div class="md-content">
            <div class="confirm-tips">
              <slot name="message"></slot>
            </div>
            <div class="btn-wrap">
              <slot name="btnGroup"></slot>
            </div>
          </div>
        </div>
      </div>
      <div class="md-overlay" v-if="mdShow" @click="closeModal"></div>
    </div>
</template>
<style>

</style>
<script>
    export default{
        props:["mdShow"],//父组件传给子组件的值，通过props来接收父组件传过来的值
        data(){
            return{
                msg:'hello vue'
            }
        },
        methods:{
          closeModal(){//触发父组件关闭模态框
            this.$emit("close");
          }
        }
    }
</script>
