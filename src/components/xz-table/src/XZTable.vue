<template>
    <div class="component xz-table">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: 'XzTable',
    mounted () {
        console.log(this.$refs)
    }
}
</script>

<style lang="scss">
.component.xz-table {}
</style>
