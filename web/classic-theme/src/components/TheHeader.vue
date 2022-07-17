<template>
  <div role="navigation" class="navbar navbar-inverse navbar-fixed-top" id="header">
    <div class="navbar-inner">
      <div class="container">
        <div class="navbar-header">
          <a href="#" class="navbar-brand">{{ config.title }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useConfig from '@nodestatus/web-utils/vue/hooks/useConfig';

const config = useConfig()!;
</script>

<style>
#header {
  min-height: 40px;
}

#header .navbar-brand {
  color: #fff;
  font-size: 20px;
}
</style>
