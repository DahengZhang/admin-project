<template>
    <div class="app">
        <button @click="eOpenPage('http://www.baidu.com')">打开新页面</button>
        <button @click="eLoadPage('http://www.baidu.com')">跳转页面</button>
        <button @click="selectFile(0)">选择文件</button>
        <button @click="selectFile(1)">选择文件夹</button>
        <button @click="zipFile()">压缩文件{{isZip}}</button>
        <br />
        selectedFiles:
        <ul>
            <li v-for="item in selectedFiles" :key="item">{{item}}</li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'App',
    data () {
        return {
            selectedFiles: [],
            isZip: ''
        }
    },
    methods: {
        async selectFile (isDirectory) {
            try {
                const targetPath = isDirectory ? await this.eSelectFolders() : await this.eSelectFiles()
                this.selectedFiles = this.selectedFiles.concat(targetPath)
            } catch (error) {
                console.error(error)
            }
        },
        async zipFile () {
            try {
                const targetPath = await this.eSelectFolder()
                const zipResult = await this.eZipFile(targetPath, this.selectedFiles)
                console.log(zipResult)
            } catch (error) {
                console.error(error)
            }
        }
    }
}
</script>
