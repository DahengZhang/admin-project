<template>
    <div class="page pack">
        <button @click="eLoadPage('/')">返回之前页面</button>
        <button @click="readFolder">读取文件夹列表</button>
        This is files list
        <label v-for="(item, index) in dirs" :key="item + index"><input type="checkbox">{{item}}</label>
    </div>
</template>

<script>
export default {
    name: 'PackPage',
    data () {
        return {
            dirs: []
        }
    },
    methods: {
        async readFolder () {
            this.dirs = await this.eReadFolder()
        }
    }
}
</script>

<style lang="scss">
.page.pack {}
</style>
