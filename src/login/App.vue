<template>
    <div class="app">
        <button @click="localStore()">存储</button>
        <button @click="downloadFile()">下载</button>
        <button @click="openPage('http://www.baidu.com')">打开新页面</button>
        <button @click="loadPage('pack')">跳转页面</button>
        <button @click="selectFile(0)">选择文件</button>
        <button @click="selectPPT()">选择PPT</button>
        <button @click="selectFile(1)">选择文件夹</button>
        <button @click="zipFile()">压缩文件</button>
        <button @click="openFile()">打开文件</button>
        <button @click="printServer()">查看server</button>
        <br />
        selectedFiles:
        <ul>
            <li v-for="item in selectedFiles" :key="item">{{item}}</li>
        </ul>
    </div>
</template>

<script>
import { getServerIp } from 'root/configs/server'

export default {
    name: 'App',
    data () {
        return {
            selectedFiles: []
        }
    },
    methods: {
        printServer () {
            console.log(getServerIp())
        },
        localStore () {
            this.eSetStore('name1', { name: 'sssss' })
            // this.eSetStore('name', null)
            // this.eSetStore('name', undefined)
            // this.eSetStore('name', 'ssssss')
            this.eSetStore('name2', ['as', 'af'], true)
            // this.eRemoveStore('name')
            console.log(this.eGetStore('name1'))
            console.log(this.eGetStore('name2'))
        },
        openPage (target) {
            this.eOpenPage(target)
        },
        loadPage (target) {
            this.eLoadPage(target)
        },
        async selectFile (isDirectory) {
            try {
                const targetPath = isDirectory ? await this.eSelectFolders() : await this.eSelectFiles()
                this.selectedFiles = this.selectedFiles.concat(targetPath)
            } catch (error) {
                console.error(error)
            }
        },
        async selectPPT () {
            try {
                const res = await this.eSelectFile({ filters: 'ppt' })
                console.log(res)
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
        },
        async downloadFile () {
            try {
                // http://192.168.0.106:8092/feifanScore/nologin/export?desc=true&examRoom=93ba0f3a1e8144a0bff1f531bb2145f3&projectId=456d61a6c80d4ab78bf2d57cc2d52456&type=1
                // http://192.168.0.106:8092/feifanScore/nologin/export?projectId=456d61a6c80d4ab78bf2d57cc2d52456&examRoom=93ba0f3a1e8144a0bff1f531bb2145f3&type=1&desc=true
                // http://192.168.0.112:8081/feifanScore/nologin/export?projectId=456d61a6c80d4ab78bf2d57cc2d52456&examRoom=93ba0f3a1e8144a0bff1f531bb2145f3&type=1&desc=true
                const res = await this.eDownload('http://192.168.0.106:8092/feifanScore/nologin/export?projectId=456d61a6c80d4ab78bf2d57cc2d52456&examRoom=93ba0f3a1e8144a0bff1f531bb2145f3&type=1&desc=true')
                console.log('下载完成', res)
            } catch (error) {
                console.error(error)
            }
        },
        async openFile () {
            try {
                this.eOpenFile(await this.eSelectFile())
            } catch (error) {
                console.error(error)
            }
        }
    }
}
</script>

<style lang="scss">
.app {}
</style>
