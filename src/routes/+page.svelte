<script>
  import MultiTable from './multi-table.svelte'
  import ModifiedSRT from '../store';
  import Parser from 'srt-parser-2';

  function download(_, fileName = 'newFile.srt') {
    
    const aData = $ModifiedSRT
    if (!aData.length) {alert('Nothing to download.'); return;}

    const parser = new Parser;
    const sData = parser.toSrt(aData);

    // Convert the text to BLOB.
    const textToBLOB = new Blob([sData], { type: 'text/plain;charset=UTF-8' });

    let newLink = document.createElement("a");
    newLink.download = fileName;

    if (window.webkitURL != null) {
        newLink.href = window.webkitURL.createObjectURL(textToBLOB);
    }
    else {
        newLink.href = window.URL.createObjectURL(textToBLOB);
        newLink.style.display = "none";
        document.body.appendChild(newLink);
    }

    newLink.click(); 
  }
</script>

<header>
    <h1>Multi Replace</h1>
    <button on:click={download}>Download</button>
</header>

<MultiTable />

<style>
  header {
    padding: 0 5em;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  button {
    height: 2rem;
  }
</style>


