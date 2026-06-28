<script lang="ts" setup>
import useConfig from '@nodestatus/web-utils/vue/hooks/useConfig';

const config = useConfig()!;
</script>

<template>
  <div id="header" role="navigation" class="navbar navbar-inverse navbar-fixed-top">
    <div class="navbar-inner">
      <div class="container">
        <div class="navbar-header">
          <a href="#" class="navbar-brand">{{ config.title }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
#header {
  min-height: 40px;
}

#header .navbar-brand {
  color: #fff;
  font-size: 20px;
}
</style>
