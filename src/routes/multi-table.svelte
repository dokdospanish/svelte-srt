<script>
  import { onMount } from 'svelte';
  import srtParser2 from 'srt-parser-2';
  import modifyText from './modify.js'
  import localSRT from './srt.js' // Get data from short sample string
  import ModifiedSRT from '../store.js'
  import rules from './rules'
  import Cell from './subtitle-cell.svelte'

  const FILE_NAME = 'EP25.srt'
  const USE_LOCAL = false;

  const FILE_URL = 'https://raw.githubusercontent.com/dokdospanish/test-files/main/srt/' + encodeURI(FILE_NAME);
  let originalSRT = [];
  let leftSearch;
  let rightSearch;
  let leftRx;
  let rightRx;

  $: {
    try {
      leftRx = new RegExp(leftSearch)
    }
    catch (e) {
      leftRx = /(?:)/
    }
    try {
      rightRx = new RegExp(rightSearch)
    }
    catch (e) {
      rightRx = /(?:)/
    }  
  }

  // OR get data from server
  onMount(async() => {
    await fetch(FILE_URL)
      .then(res => res.text())
      .then(data => {
        let srt = USE_LOCAL ? localSRT : data;
        parse(srt);
      })
      .catch(error => { console.log(error) } );
  });

  function parse(srt) {
    const parser = new srtParser2();
    originalSRT = parser.fromSrt(srt);

    $ModifiedSRT = modifyText(originalSRT, rules)

  }

</script>

<div id="search-as-regex">
  <h3>{leftRx}</h3>
  <h3>{rightRx}</h3>
</div>


<table>
  <thead>
    <tr>
      <th>ID</th><th>Start</th><th>End</th>
      <th bind:textContent={leftSearch} contenteditable="true"></th>
      <th bind:textContent={rightSearch} contenteditable="true"></th>
    </tr>
  </thead>
  <tbody>
    {#each originalSRT as sub, i}
      {#if leftRx.test(sub.text) && rightRx.test($ModifiedSRT[i].text)}
      <tr>
        <td>{i + 1}</td>
        <td>{sub.startTime}</td>
        <td>{sub.endTime}</td>
        <td>
          <Cell text={sub.text}/>
        </td>
        <td>
          <Cell text={$ModifiedSRT[i].text}/>
        </td>
      </tr>
      {/if}
    {/each}
  </tbody>
</table>

<style>
  #search-as-regex {
    display: flex;
    justify-content: space-between;
  }
  table {
    display: grid;
    border-collapse: collapse;
    min-width: 100%;
    grid-template-columns: 
      10ch
      15ch
      15ch
      minmax(150px, 1fr)
      minmax(150px, 1fr)
  }
  
  thead,
  tbody,
  tr {
    display: contents;
  }
  
  th,
  td {
    padding: 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    /* white-space: nowrap; */
    /* white-space: pre-line; */
    white-space: pre; /* SHOW DOUBLE SPACES! */
  /*   display: grid;
    place-items: center;*/
    text-align: center; 
    /* word-break: keep-all; */
  }
  
  th {
    position: sticky;
    top: 0;
    background: #6c7ae0;
    font-weight: normal;
    font-size: 1.1rem;
    color: white;
  }
  
  th:last-child {
    border: 0;
  }
  
  td {
    padding-top: 10px;
    padding-bottom: 10px;
    color: dimgray;
  }
  
  tr:nth-child(even) td {
    background: #f8f6ff;
  }
</style>
  