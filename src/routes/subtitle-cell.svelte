<script>
  export let text
</script>

  {#each text.split('\n') as line, i}
    {#if i === 0}
      {line}
    {:else}
      <span class="break"></span>
      {'\n' + line}
    {/if}
  {/each}

<style>
    span.break::after {
    content: "<br>";
    color: silver;
    font-size: 0.9em;
    font-weight: bold;
    font-style: oblique;
    font-variant: small-caps;
  }
</style>