<template>
  <div class="footer">
    <p>Powered by <a href="https://github.com/cokemine/nodestatus">NodeStatus</a></p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TheFooter'
});
</script>

<style>
.footer p {
  text-align: center;
  padding-bottom: 15px;
}

.footer p a {
  transition: color .3s ease;
}

.footer p a:hover {
  color: #ff779a;
}
</style>
