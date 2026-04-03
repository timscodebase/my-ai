<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import "./global.css";

  import { Footer, Nav } from "$lib";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="page-wrap">
  <Nav />

  <main>
    {@render children()}
  </main>

  <Footer />
</div>

<style>
  .page-wrap {
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
    padding: var(--spacing);
  }
</style>
