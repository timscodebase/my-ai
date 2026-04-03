<script>
  import { resolve } from "$app/paths";
</script>

<header>
  <h1>My AI App</h1>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/chat">AI Chat</a></li>
      <li><a href={resolve("/demo/better-auth")}>Auth Demo</a></li>
    </ul>
  </nav>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    ul {
      list-style: none;
      display: flex;
      gap: 1rem;
    }

    a {
      text-decoration: none;
      color: inherit;
    }
  }
</style>
