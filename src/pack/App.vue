<template>
    <div class="page pack">
        <button @click="eLoadPage('/')">返回之前页面</button>
        <button @click="readFolder">读取文件夹列表</button>
        <button @click="pack">开始打包</button>
        This is files list
        <label v-for="(item, index) in dirs" :key="item + index"><input v-model="selected" :value="item" type="checkbox">{{item}}</label>
    </div>
</template>

<script>
export default {
    name: 'PackPage',
    data () {
        return {
            dirs: [],
            selected: []
        }
    },
    methods: {
        async readFolder () {
            this.dirs = await this.eReadFolder()
        },
        async pack () {
            const res = await this.eZipFile(this.selected)
            console.log('res', res)
        }
    }
}
</script>

<style lang="scss">
.page.pack {}
</style>
