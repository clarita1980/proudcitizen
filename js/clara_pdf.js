// http://jsbin.com/pdfjs-prevnext-v2/2913/edit
// http://mozilla.github.io/pdf.js/
$(function() {

  // pdfDocs is an array of pdf document objects
  // example object:
  // { doc: DocObj, 
  //   pageNum: 1,
  //   scale: 0.8,
  //   canvas: canvas element,
  //   ctx: canvas context
  // }
  pdfDocs = [];

  // new document created each time it is embedded
  newDoc = null;

  // doc_id tracks which doc is being worked on ( loaded, rendered )
  doc_id = 0;

  // docs to load, example: { id: "element id", url: "pdf URL"}
  pdfsToLoad = [];

  embedPDF = function(element_id,url) {
    
    PDFJS.disableWorker = true;
    
    var newDoc = {
      element_id: element_id,
      url: url,
      id: null, // id and index in pdfDocs array 
      doc: null, 
      pageNum: 1, 
      scale: 0.8, 
      canvas: document.getElementById(element_id)
    };
    newDoc.ctx = newDoc.canvas.getContext('2d')
    PDFJS.getDocument(url).then(function getPdfHelloWorld(_pdfDoc) {
      newDoc.doc = _pdfDoc;
      newDoc.id = doc_id = pdfDocs.length;
      pdfDocs.push(newDoc);
      renderPage(pdfDocs[doc_id].pageNum);
      loadNextPDF();
    });

    renderPage = function(num) {
      // Using promise to fetch the page
      var doc = pdfDocs[doc_id].doc;
      doc.getPage(num).then(function(page) {
        var viewport = page.getViewport(pdfDocs[doc_id].scale);
        pdfDocs[doc_id].canvas.height = viewport.height;
        pdfDocs[doc_id].canvas.width = viewport.width;
        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: pdfDocs[doc_id].ctx,
          viewport: viewport
        };
        page.render(renderContext);
      });
      // Update page counters
      document.getElementById('page_num').textContent = pdfDocs[doc_id].pageNum;
      document.getElementById('page_count').textContent = pdfDocs[doc_id].doc.numPages;
    }
    goPrevious = function(did) {
      doc_id = did;
      if (pdfDocs[doc_id].pageNum <= 1) {
        return;
      }
      pdfDocs[doc_id].pageNum--;
      renderPage(pdfDocs[doc_id].pageNum);
    }
    goNext = function(did) {
      doc_id = did;
      console.log(doc_id);
      console.log(pdfDocs[doc_id]);
      if (pdfDocs[doc_id].pageNum >= pdfDocs[doc_id].doc.numPages) {
        return;
      }
      pdfDocs[doc_id].pageNum++;
      renderPage(pdfDocs[doc_id].pageNum);
    }
  }

  loadNextPDF = function() {
    var nextPDF = pdfsToLoad.pop();
    if(nextPDF) {
      embedPDF(nextPDF.id,nextPDF.url);
    }
  }

  if($(".pdf-embed").length) {
    var page_docs = $(".pdf-embed");
    for(i=0;i<page_docs.length;i++) {
      var el = $(page_docs[i]);
      el.after('<div class="pdf-embed-controls"><a href="'+el.data('pdf')+'">Download PDF</a><button id="next" class="tiny radius" onclick="goNext('+(page_docs.length-i-1)+')">Next Slide</button>&nbsp;&nbsp;<button id="prev" class="tiny radius" onclick="goPrevious('+(page_docs.length-i-1)+')">Previous Slide</button><span>Page: <span id="page_num"></span> / <span id="page_count"></span></span>');
      pdfsToLoad.push( { id: el.attr('id'), url: el.data('pdf') });
    }
    loadNextPDF();
  }
});