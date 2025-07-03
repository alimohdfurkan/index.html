// SIS/JNU Citation Generator with Access Date logic

document.getElementById('sis-citation').innerHTML = `
  <form id="sisFormBlock" autocomplete="off" class="p-2">
    <div class="sis-row mb-2">
      <div class="sis-col">
        <label class="form-label">Citation Format</label>
        <select class="form-select" id="citationType">
          <option value="reference">Reference List</option>
          <option value="footnote">Footnote</option>
        </select>
      </div>
      <div class="sis-col">
        <label class="form-label">Source Type</label>
        <select class="form-select" id="sourceType" onchange="updateSisForm()">
          <option value="book">Book</option>
          <option value="book-isbn">Book (by ISBN)</option>
          <option value="reprint">Book (Reprinted)</option>
          <option value="multivol">Book (Multiple Volumes)</option>
          <option value="translated">Translated Book</option>
          <option value="journal">Journal Article</option>
          <option value="journal-doi">Journal Article (by DOI)</option>
          <option value="chapter">Chapter in Edited Volume</option>
          <option value="newspaper">Newspaper/Magazine Article</option>
          <option value="online-news">Online News Article (by URL)</option>
          <option value="thesis">Thesis/Dissertation</option>
          <option value="govt">Govt/IGO/NGO Report</option>
          <option value="legal">Legal Case</option>
          <option value="treaty">Treaty/UN Document</option>
          <option value="indirect">Indirect/Quoted Source</option>
          <option value="web">Internet Source</option>
          <option value="video">Online Video/Webinar</option>
          <option value="lecture">Lecture/Speech</option>
          <option value="personal">Interview/Letter/Email</option>
        </select>
      </div>
    </div>
    <div id="sisFetchRow"></div>
    <div id="sisFormFields"></div>
    <div id="sisAccessDateRow"></div>
    <div class="d-flex gap-2 mt-1">
      <button class="btn btn-main" type="button" onclick="generateSisCitation()">Generate</button>
      <button class="btn btn-secondary" type="button" onclick="copySisCitation()">Copy</button>
      <button class="btn btn-outline-danger" type="button" onclick="clearSisForm()">Clear</button>
    </div>
    <div id="outputCitation" class="mt-1"></div>
  </form>
`;

const sisRows = {
  name: `<div class="sis-row"><div class="sis-col">
    <label class="form-label">Author's First Name(s)</label>
    <input type="text" class="form-control" id="firstName" placeholder="e.g. John A." oninput="this.value=capitalizeWords(this.value)">
  </div>
  <div class="sis-col">
    <label class="form-label">Author's Last Name</label>
    <input type="text" class="form-control" id="lastName" placeholder="e.g. Smith" oninput="this.value=capitalizeWords(this.value)">
  </div></div>`,
  titleYear: `<div class="sis-row"><div class="sis-col">
    <label class="form-label">Year</label>
    <input type="text" class="form-control" id="year" placeholder="e.g. 2004"></div>
    <div class="sis-col">
    <label class="form-label">Title of Work</label>
    <input type="text" class="form-control" id="title"></div></div>`,
  bookPub: `<div class="sis-row"><div class="sis-col">
    <label class="form-label">Place of Publication</label>
    <input type="text" class="form-control" id="bookPlace" oninput="this.value=capitalizeWords(this.value)"></div>
    <div class="sis-col">
    <label class="form-label">Publisher</label>
    <input type="text" class="form-control" id="bookPublisher" oninput="this.value=capitalizeWords(this.value)"></div></div>`,
  reprint: `<div class="sis-row"><div class="sis-col">
    <label class="form-label">Original Publication Year</label>
    <input type="text" class="form-control" id="originalYear"></div>
    <div class="sis-col">
    <label class="form-label">Reprint Year</label>
    <input type="text" class="form-control" id="reprintYear"></div></div>`,
  multivol: `<div class="sis-row"><div class="sis-col">
    <label class="form-label">Volume Info</label>
    <input type="text" class="form-control" id="volumeInfo" placeholder="Vol. I, Vol. II, etc."></div>
    <div class="sis-col">
    <label class="form-label">Page Numbers</label>
    <input type="text" class="form-control" id="pages" placeholder="e.g. pp. 12-25"></div></div>`,
  translated: `<div class="sis-row"><div class="sis-col">
    <label class="form-label">Translator's First Name(s)</label>
    <input type="text" class="form-control" id="translatorFirst" placeholder="e.g. Jane" oninput="this.value=capitalizeWords(this.value)"></div>
    <div class="sis-col">
    <label class="form-label">Translator's Last Name</label>
    <input type="text" class="form-control" id="translatorLast" placeholder="e.g. Doe" oninput="this.value=capitalizeWords(this.value)"></div></div>`,
  journal: `<div class="sis-row"><div class="sis-col">
    <label class="form-label">Journal Name</label>
    <input type="text" class="form-control" id="journalName" oninput="this.value=capitalizeWords(this.value)"></div>
    <div class="sis-col">
    <label class="form-label">Volume (issue)</label>
    <input type="text" class="form-control" id="volumeIssue"></div></div>
    <div class="sis-row"><div class="sis-col">
    <label class="form-label">Article Pages</label>
    <input type="text" class="form-control" id="pages"></div>
    <div class="sis-col">
    <label class="form-label">DOI</label>
    <input type="text" class="form-control" id="citationDOI"></div></div>`,
  chapter: `<div class="sis-row"><div class="sis-col">
    <label class="form-label">Editor(s)</label>
    <input type="text" class="form-control" id="editors" oninput="this.value=capitalizeWords(this.value)"></div>
    <div class="sis-col">
    <label class="form-label">Book Title</label>
    <input type="text" class="form-control" id="bookTitle" oninput="this.value=capitalizeWords(this.value)"></div></div>
    <div class="sis-row"><div class="sis-col">
    <label class="form-label">Place of Publication</label>
    <input type="text" class="form-control" id="chapterPlace" oninput="this.value=capitalizeWords(this.value)"></div>
    <div class="sis-col">
    <label class="form-label">Publisher</label>
    <input type="text" class="form-control" id="chapterPublisher" oninput="this.value=capitalizeWords(this.value)"></div></div>`,
  newspaper: `<div class="sis-row"><div class="sis-col">
    <label class="form-label">Newspaper Name</label>
    <input type="text" class="form-control" id="newspaperName" oninput="this.value=capitalizeWords(this.value)"></div>
    <div class="sis-col">
    <label class="form-label">City</label>
    <input type="text" class="form-control" id="city" oninput="this.value=capitalizeWords(this.value)"></div></div>
    <div class="sis-row"><div class="sis-col">
    <label class="form-label">Date (e.g. 12 March 2023)</label>
    <input type="text" class="form-control" id="newspaperDate"></div></div>`,
  onlineNews: `<div class="sis-row"><div class="sis-col">
    <label class="form-label">News URL</label>
    <div class="input-group">
      <input type="text" class="form-control" id="newsURL" placeholder="Paste news link here">
      <button id="fetchNewsBtn" class="btn btn-secondary" type="button" tabindex="-1" style="min-width:75px;">Fetch</button>
    </div>
    </div></div>`,
  webURL: `<div class="sis-row"><div class="sis-col">
    <label class="form-label">Web Page URL</label>
    <div class="input-group">
      <input type="text" class="form-control" id="webURL" placeholder="Paste web link here">
      <button id="fetchWebBtn" class="btn btn-secondary" type="button" tabindex="-1" style="min-width:75px;">Fetch</button>
    </div>
    </div></div>`,
  videoURL: `<div class="sis-row"><div class="sis-col">
    <label class="form-label">Video URL</label>
    <div class="input-group">
      <input type="text" class="form-control" id="videoURL" placeholder="Paste video link here">
      <button id="fetchVideoBtn" class="btn btn-secondary" type="button" tabindex="-1" style="min-width:75px;">Fetch</button>
    </div>
    </div></div>`,
  isbn: `<div class="sis-row"><div class="sis-col">
    <label class="form-label">ISBN Number</label>
    <div class="input-group">
      <input type="text" class="form-control" id="isbn" placeholder="e.g. 9780140449136">
      <button id="fetchISBNBtn" class="btn btn-secondary" type="button" tabindex="-1" style="min-width:75px;">Fetch</button>
    </div>
    </div></div>`,
  doi: `<div class="sis-row"><div class="sis-col">
    <label class="form-label">DOI</label>
    <div class="input-group">
      <input type="text" class="form-control" id="doi" placeholder="e.g. 10.1038/nphys1170">
      <button id="fetchDOIBtn" class="btn btn-secondary" type="button" tabindex="-1" style="min-width:75px;">Fetch</button>
    </div>
    </div></div>`
};

const accessDateRow = `<div class="sis-row"><div class="sis-col">
  <label class="form-label">Access Date</label>
  <input type="date" class="form-control" id="accessDate">
</div></div>`;

window.capitalizeWords = str =>
  str.replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

window.updateSisForm = function () {
  const type = document.getElementById("sourceType").value;
  let fetchRow = '';
  let html = '';
  let showAccessDate = (type === "web" || type === "online-news" || type === "video");

  // Place fetchable fields right after source type!
  if (type === "book-isbn")      fetchRow = sisRows.isbn;
  else if (type === "journal-doi") fetchRow = sisRows.doi;
  else if (type === "web")         fetchRow = sisRows.webURL;
  else if (type === "video")       fetchRow = sisRows.videoURL;
  else if (type === "online-news") fetchRow = sisRows.onlineNews;
  document.getElementById('sisFetchRow').innerHTML = fetchRow;

  // Compact, side-by-side fields
  if (type === "book") html = sisRows.name + sisRows.titleYear + sisRows.bookPub;
  else if (type === "book-isbn") html = sisRows.name + sisRows.titleYear + sisRows.bookPub;
  else if (type === "reprint") html = sisRows.name + sisRows.titleYear + sisRows.bookPub + sisRows.reprint;
  else if (type === "multivol") html = sisRows.name + sisRows.titleYear + sisRows.bookPub + sisRows.multivol;
  else if (type === "translated") html = sisRows.name + sisRows.titleYear + sisRows.bookPub + sisRows.translated;
  else if (type === "journal") html = sisRows.name + sisRows.titleYear + sisRows.journal;
  else if (type === "journal-doi") html = sisRows.name + sisRows.titleYear + sisRows.journal;
  else if (type === "chapter") html = sisRows.name + sisRows.titleYear + sisRows.chapter;
  else if (type === "newspaper") html = sisRows.name + sisRows.titleYear + sisRows.newspaper;
  else if (type === "online-news") html = sisRows.name + sisRows.titleYear + sisRows.newspaper;
  else if (type === "thesis") html = sisRows.name + sisRows.titleYear + `<div class="sis-row"><div class="sis-col"><label class="form-label">Thesis Type</label><input type="text" class="form-control" id="thesisType"></div><div class="sis-col"><label class="form-label">Place</label><input type="text" class="form-control" id="thesisPlace" oninput="this.value=capitalizeWords(this.value)"></div></div><div class="sis-row"><div class="sis-col"><label class="form-label">University</label><input type="text" class="form-control" id="thesisUniversity" oninput="this.value=capitalizeWords(this.value)"></div></div>`;
  else if (type === "govt") html = 
    `<div class="sis-row">
      <div class="sis-col">
        <label class="form-label">Organisation Name</label>
        <input type="text" class="form-control" id="govtName" oninput="this.value=capitalizeWords(this.value)">
      </div>
      <div class="sis-col">
        <label class="form-label">Year</label>
        <input type="text" class="form-control" id="year" placeholder="e.g. 2023">
      </div>
    </div>
    <div class="sis-row">
      <div class="sis-col">
        <label class="form-label">Report Title/Details</label>
        <input type="text" class="form-control" id="govtTitle">
      </div>
      <div class="sis-col">
        <label class="form-label">Publication Details (number, etc)</label>
        <input type="text" class="form-control" id="govtDetails">
      </div>
      <div class="sis-col">
        <label class="form-label">Place</label>
        <input type="text" class="form-control" id="govtPlace" oninput="this.value=capitalizeWords(this.value)">
      </div>
    </div>`;
  else if (type === "legal") html = `<div class="sis-row"><div class="sis-col"><label class="form-label">Case Title</label><input type="text" class="form-control" id="caseTitle"></div><div class="sis-col"><label class="form-label">Volume/Report</label><input type="text" class="form-control" id="caseReport"></div></div><div class="sis-row"><div class="sis-col"><label class="form-label">Year</label><input type="text" class="form-control" id="caseYear"></div><div class="sis-col"><label class="form-label">Court & Page/Para</label><input type="text" class="form-control" id="caseCourt"></div></div>`;
  else if (type === "treaty") html = `<div class="sis-row"><div class="sis-col"><label class="form-label">Title of Treaty/Document</label><input type="text" class="form-control" id="treatyTitle"></div><div class="sis-col"><label class="form-label">Publication Details</label><input type="text" class="form-control" id="treatyDetails"></div></div>`;
  else if (type === "indirect") html = `<div class="sis-row"><div class="sis-col"><label class="form-label">Original Source Full Reference</label><textarea class="form-control" id="originalSource"></textarea></div><div class="sis-col"><label class="form-label">Secondary Source Full Reference ("quoted in"/"cited in")</label><textarea class="form-control" id="secondarySource"></textarea></div></div>`;
  else if (type === "web") html = sisRows.name + sisRows.titleYear + `<div class="sis-row"><div class="sis-col"><label class="form-label">Source (Organisation or Website Name)</label><input type="text" class="form-control" id="webSource" oninput="this.value=capitalizeWords(this.value)"></div></div>`;
  else if (type === "video") html = `<div class="sis-row"><div class="sis-col"><label class="form-label">Presenter / Channel Name</label><input type="text" class="form-control" id="videoAuthor"></div><div class="sis-col"><label class="form-label">Year (or date)</label><input type="text" class="form-control" id="videoYear" placeholder="e.g. 2023 or 2023, June 4"></div></div><div class="sis-row"><div class="sis-col"><label class="form-label">Video Title</label><input type="text" class="form-control" id="videoTitle"></div><div class="sis-col"><label class="form-label">Platform</label><input type="text" class="form-control" id="videoPlatform"></div></div><div class="sis-row"><div class="sis-col"><label class="form-label">Video Link</label><input type="text" class="form-control" id="videoURL"></div></div>`;
  else if (type === "lecture") html = `<div class="sis-row"><div class="sis-col"><label class="form-label">Speaker Name</label><input type="text" class="form-control" id="speakerName" oninput="this.value=capitalizeWords(this.value)"></div><div class="sis-col"><label class="form-label">Title/Occasion</label><input type="text" class="form-control" id="lectureTitle" oninput="this.value=capitalizeWords(this.value)"></div></div><div class="sis-row"><div class="sis-col"><label class="form-label">Date/Place</label><input type="text" class="form-control" id="lectureDatePlace" oninput="this.value=capitalizeWords(this.value)"></div></div>`;
  else if (type === "personal") html = `<div class="sis-row"><div class="sis-col"><label class="form-label">Person Name</label><input type="text" class="form-control" id="personName" oninput="this.value=capitalizeWords(this.value)"></div><div class="sis-col"><label class="form-label">Type (e-mail/interview/letter)</label><input type="text" class="form-control" id="personalType"></div></div><div class="sis-row"><div class="sis-col"><label class="form-label">Date & Place</label><input type="text" class="form-control" id="personalDatePlace"></div></div>`;
  document.getElementById('sisFormFields').innerHTML = html;

  // Access Date field
  document.getElementById('sisAccessDateRow').innerHTML = showAccessDate ? accessDateRow : '';

  // Attach fetch logic for new fields
  if (type === "book-isbn")      document.getElementById("fetchISBNBtn").onclick = fetchBookByISBN;
  if (type === "journal-doi")    document.getElementById("fetchDOIBtn").onclick = fetchJournalByDOI;
  if (type === "web")            document.getElementById("fetchWebBtn").onclick = fetchWebPage;
  if (type === "video")          document.getElementById("fetchVideoBtn").onclick = fetchVideoMeta;
  if (type === "online-news")    document.getElementById("fetchNewsBtn").onclick = fetchNewsMeta;
};
window.updateSisForm();

window.generateSisCitation = function () {
  const type = document.getElementById("sourceType").value;
  const mode = document.getElementById("citationType").value;
  function val(id) { let el = document.getElementById(id); return el ? el.value.trim() : ""; }
  function formatDate(d) {
    if (!d) return "";
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const [y, m, day] = d.split("-");
    return `${parseInt(day)} ${months[parseInt(m)-1]}, ${y}`;
  }
  let c = "";
  try {
    if (type === "book" || type === "book-isbn") {
      c = `${val("lastName")}, ${val("firstName")} (${val("year")}), <i>${val("title")}</i>, ${val("bookPlace")}: ${val("bookPublisher")}.`;
    } else if (type === "reprint") {
      c = `${val("lastName")}, ${val("firstName")} (${val("originalYear")}), <i>${val("title")}</i>, ${val("bookPlace")}: ${val("bookPublisher")}, reprinted ${val("reprintYear")}.`;
    } else if (type === "multivol") {
      c = `${val("lastName")}, ${val("firstName")} (${val("year")}), <i>${val("title")}</i>, ${val("volumeInfo")}, ${val("bookPlace")}: ${val("bookPublisher")}. Pages: ${val("pages")}`;
    } else if (type === "translated") {
      c = `${val("lastName")}, ${val("firstName")} (${val("year")}), <i>${val("title")}</i>, Translated by ${val("translatorFirst")} ${val("translatorLast")}, ${val("bookPlace")}: ${val("bookPublisher")}.`;
    } else if (type === "journal" || type === "journal-doi") {
      let doi = val("citationDOI") || val("doi");
      c = `${val("lastName")}, ${val("firstName")} (${val("year")}), “${val("title")}”, <i>${val("journalName")}</i>, ${val("volumeIssue")}: ${val("pages")}${doi ? ", DOI: " + doi : ""}.`;
    } else if (type === "chapter") {
      c = `${val("lastName")}, ${val("firstName")} (${val("year")}), “${val("title")}”, in ${val("editors")} (eds.) <i>${val("bookTitle")}</i>, ${val("chapterPlace")}: ${val("chapterPublisher")}.`;
    } else if (type === "newspaper") {
      c = `${val("lastName")}, ${val("firstName")} (${val("year")}), “${val("title")}”, <i>${val("newspaperName")}</i>, ${val("city")}, ${val("newspaperDate")}.`;
    } else if (type === "online-news") {
      let access = val("accessDate") ? ` Accessed ${formatDate(val("accessDate"))},` : "";
      c = `${val("lastName")}, ${val("firstName")} (${val("year")}), “${val("title")}”, <i>${val("newspaperName")}</i>, ${val("city")}, ${val("newspaperDate")}.${access ? access : ""} [Online] ${val("newsURL")}`;
    } else if (type === "thesis") {
      c = `${val("lastName")}, ${val("firstName")} (${val("year")}), <i>${val("title")}</i>, ${val("thesisType")}, ${val("thesisPlace")}: ${val("thesisUniversity")}.`;
    } else if (type === "govt") {
      let yearVal = val("year");
      c = `${val("govtName")}${yearVal ? " ("+yearVal+")" : ""}, ${val("govtTitle")}${val("govtDetails") ? ', '+val("govtDetails") : ''}, ${val("govtPlace")}.`;
    } else if (type === "legal") {
      c = `${val("caseTitle")}, ${val("caseReport")}, ${val("caseYear")}, ${val("caseCourt")}.`;
    } else if (type === "treaty") {
      c = `${val("treatyTitle")}, ${val("treatyDetails")}.`;
    } else if (type === "indirect") {
      c = `${val("originalSource")} Quoted in ${val("secondarySource")}`;
    } else if (type === "web") {
      let access = val("accessDate") ? ` Accessed ${formatDate(val("accessDate"))},` : "";
      c = `${val("lastName")}, ${val("firstName")} (${val("year")}), “${val("title")}”, ${val("webSource")}, [Online: web]${access} URL: <a href="${val("webURL")}" target="_blank">${val("webURL")}</a>.`;
    } else if (type === "video") {
      let accessed = val("accessDate") ? ` Accessed ${formatDate(val("accessDate"))},` : "";
      c = `${val("videoAuthor")}. (${val("videoYear")}). <i>${val("videoTitle")}</i> [Video]. ${val("videoPlatform")}. ${val("videoURL")}.${accessed}`;
    } else if (type === "lecture") {
      c = `${val("speakerName")} (${val("lectureDatePlace")}), “${val("lectureTitle")}", Lecture.`;
    } else if (type === "personal") {
      c = `${val("personName")} (${val("personalDatePlace")}), ${val("personalType")}.`;
    }
    // Footnote (short) mode
    if (mode === "footnote" && ["book","book-isbn","journal","journal-doi","chapter","newspaper","online-news"].includes(type)) {
      if (val("lastName") && val("title")) c = `${val("lastName")}, <i>${val("title")}</i>.`;
    }
  } catch {
    c = "Not implemented or missing fields.";
  }
  document.getElementById("outputCitation").innerHTML = c;
};

window.copySisCitation = function () {
  let el = document.createElement('textarea');
  el.value = document.getElementById("outputCitation").innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  alert("Citation copied!");
};
window.clearSisForm = function () {
  updateSisForm();
  document.getElementById("outputCitation").innerHTML = '';
};

// Book by ISBN lookup (OpenLibrary)
window.fetchBookByISBN = async function () {
  let isbn = document.getElementById("isbn").value.replace(/[-\s]/g, "");
  if (!isbn) { alert("Enter ISBN number"); return; }
  let url = `https://openlibrary.org/isbn/${isbn}.json`;
  try {
    let r = await fetch(url);
    if (!r.ok) throw new Error();
    let data = await r.json();
    document.getElementById("title").value = data.title || "";
    document.getElementById("year").value = data.publish_date ? (data.publish_date.match(/\d{4}/) || [""])[0] : "";
    document.getElementById("bookPublisher").value = (data.publishers && data.publishers[0]) || "";
    document.getElementById("bookPlace").value = (data.publish_places && data.publish_places[0]) || "";
    if (data.authors && data.authors.length > 0) {
      let authUrl = `https://openlibrary.org${data.authors[0].key}.json`;
      let r2 = await fetch(authUrl); let a = await r2.json();
      let nameParts = (a.name || "").split(" ");
      document.getElementById("firstName").value = nameParts.slice(1).join(" ");
      document.getElementById("lastName").value = nameParts[0];
    }
  } catch {
    alert("No details found. Please fill manually.");
  }
};

// Journal by DOI lookup (Crossref)
window.fetchJournalByDOI = async function () {
  let doi = document.getElementById("doi").value.trim();
  if (!doi) { alert("Enter DOI"); return; }
  let url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  try {
    let r = await fetch(url);
    if (!r.ok) throw new Error();
    let { message: data } = await r.json();
    if (data.author && data.author[0]) {
      document.getElementById("firstName").value = data.author[0].given || "";
      document.getElementById("lastName").value = data.author[0].family || "";
    }
    document.getElementById("title").value = Array.isArray(data.title) ? data.title[0] : (data.title || "");
    document.getElementById("journalName").value = Array.isArray(data['container-title']) ? data['container-title'][0] : (data['container-title'] || "");
    document.getElementById("volumeIssue").value = (data.volume || "") + (data.issue ? `(${data.issue})` : "");
    document.getElementById("year").value = (data.issued && data.issued['date-parts'] && data.issued['date-parts'][0][0]) || "";
    document.getElementById("pages").value = data.page || "";
    document.getElementById("citationDOI").value = doi;
  } catch {
    alert("DOI not found or data incomplete. Please fill manually.");
  }
};

// Webpage metadata by URL (very basic)
window.fetchWebPage = async function () {
  let url = document.getElementById("webURL").value.trim();
  if (!url) { alert("Paste the webpage URL."); return; }
  try {
    // Try to get og:title and meta info via jsonlink.io (free, limited CORS)
    let resp = await fetch("https://jsonlink.io/api/extract?url=" + encodeURIComponent(url));
    let data = await resp.json();
    if (data.title) document.getElementById("title").value = data.title;
    if (data.author) document.getElementById("lastName").value = data.author.split(" ").pop();
    if (data.author) document.getElementById("firstName").value = data.author.split(" ").slice(0,-1).join(" ");
    // Can't reliably get year/date from most web pages.
  } catch {
    alert("Could not fetch info. Fill manually.");
  }
};
// Online video: try YouTube oEmbed for title/channel (no key needed)
window.fetchVideoMeta = async function () {
  let url = document.getElementById("videoURL").value.trim();
  if (!url) { alert("Paste the video URL."); return; }
  try {
    let resp = await fetch("https://www.youtube.com/oembed?url=" + encodeURIComponent(url) + "&format=json");
    let data = await resp.json();
    document.getElementById("videoTitle").value = data.title || "";
    document.getElementById("videoAuthor").value = data.author_name || "";
    document.getElementById("videoPlatform").value = "YouTube";
  } catch {
    alert("Could not fetch video info. Fill manually.");
  }
};
// News meta (use jsonlink, but may not always work)
window.fetchNewsMeta = async function () {
  let url = document.getElementById("newsURL").value.trim();
  if (!url) { alert("Paste the news article URL."); return; }
  try {
    let resp = await fetch("https://jsonlink.io/api/extract?url=" + encodeURIComponent(url));
    let data = await resp.json();
    if (data.title) document.getElementById("title").value = data.title;
    if (data.site) document.getElementById("newspaperName").value = data.site;
    if (data.author) document.getElementById("lastName").value = data.author.split(" ").pop();
    if (data.author) document.getElementById("firstName").value = data.author.split(" ").slice(0,-1).join(" ");
    // If meta date is present (ISO format), fill as newspaperDate or year
    if (data.date && /^\d{4}-\d{2}-\d{2}/.test(data.date)) {
      let parts = data.date.split("-");
      document.getElementById("year").value = parts[0];
      document.getElementById("newspaperDate").value = `${parseInt(parts[2])} ${["January","February","March","April","May","June","July","August","September","October","November","December"][parseInt(parts[1])-1]}, ${parts[0]}`;
    }
    // City not auto-fetched
  } catch {
    alert("Could not fetch news info. Fill manually.");
  }
};
