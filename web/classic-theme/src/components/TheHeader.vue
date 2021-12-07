<template>
  <div role="navigation" class="navbar navbar-inverse navbar-fixed-top">
    <div class="navbar-inner">
      <div class="container">
        <div class="navbar-header">
          <button data-target=".navbar-collapse" data-toggle="collapse" class="navbar-toggle" type="button">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a href="#" class="navbar-brand">NodeStatus</a>
        </div>
        <div class="navbar-collapse collapse">
          <ul class="nav navbar-nav">
            <li class="dropdown">
              <a data-toggle="dropdown" class="dropdown-toggle" href="#">风格<b class="caret"></b></a>
              <ul class="dropdown-menu">
                <li><a href="#" @click="setActiveStyleSheet('dark')">黑夜</a></li>
                <li><a href="#" @click="setActiveStyleSheet('light')">白天</a></li>
              </ul>
            </li>
          </ul>
        </div><!--/.nav-collapse -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

const setActiveStyleSheet = (theme: string): void => {
  // const links = document.getElementsByTagName('link');
  // for (let i = 0; i < links.length; i++) {
  //   const link = links[i];
  //   if (link.getAttribute('rel').indexOf('style') != -1 && link.getAttribute('title')) {
  //     link.disabled = true;
  //     if (link.getAttribute('title') === theme) {
  //       link.disabled = false;
  //     }
  //   }
  // }
};

</script>

<style>
.navbar {
  min-height: 40px;
}

.navbar-brand {
  color: #fff;
  padding: 10px;
  font-size: 20px;
}

.dropdown .dropdown-toggle {
  padding-bottom: 10px;
  padding-top: 10px;
}

.navbar-inverse .navbar-brand {
  color: #fff;
  padding: 10px;
  font-size: 20px;
}
</style>
