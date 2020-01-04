<template>
    <div class="component xz-table-column">
        表格{{stripe}}
    </div>
</template>

<script>
export default {
    name: 'XzTableColumn',
    props: {
        stripe: {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style lang="scss">
.component.xz-table-column {}
</style>
