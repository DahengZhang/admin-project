<template>
    <div class="app">
        <input v-model="ipAddr" type="text"><button @click="saveConfig()">提交</button>
        <xz-table>
            <xz-table-column stripe></xz-table-column>
            <xz-table-column stripe></xz-table-column>
        </xz-table>
        <!-- <a href="/rank.html"></a> -->
        <iframe src="/pack" frameborder="0"></iframe>
    </div>
</template>

<script>
import { XzTable, XzTableColumn } from 'src/components/xz-table'

export default {
    name: 'AppPage',
    data () {
        return {
            ipAddr: ''
        }
    },
    mounted () {
        window.ipcRenderer.on('config.ip', _ => {
            console.log('===')
        })
    },
    methods: {
        saveConfig () {
            window.ipcRenderer.send('config.ip', this.ipAddr)
        }
    },
    components: {
        XzTable,
        XzTableColumn
    }
}
</script>

<style lang="scss">
.app {}
</style>
