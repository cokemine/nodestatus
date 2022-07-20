<template>
  <div class="ui vertical masthead center aligned" id="header">
    <div class="header__content">
      <h1 class="ui inverted header">
        {{ config.title }}
      </h1>
      <p>{{ config.subTitle }}</p>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import useConfig from '@nodestatus/web-utils/vue/hooks/useConfig';

export default defineComponent({
  name: 'TheHeader',
  setup() {
    const config = useConfig()!;
    return {
      config
    };
  }
});
</script>
<style>
#header {
  height: 25rem;
  position: relative;
  /*Replace your header image at this place!*/
  background: url("../assets/img/cover.png") no-repeat center center;
}

#header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1;
  width: 100%;
  background: rgba(66, 64, 64, .15);
}

#header::after {
  content: 'Pixiv: 86597206';
  position: absolute;
  right: 15px;
  bottom: 0;
  z-index: 2;
  color: #CDCDCD;
  text-shadow: 1px 1px 1px #666;
}

.header__content {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-shadow: 2px 2px 2px #666;
  text-align: center;
}

#header h1 {
  font-size: 3.57rem;
  white-space: nowrap;
}

#header p {
  font-size: 1.5rem;
  color: aliceblue;
}
</style>
