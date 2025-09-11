(()=>{
  const safeStore = (() => {
    try{
      const t="__t"; localStorage.setItem(t,"1"); localStorage.removeItem(t); return localStorage;
    }catch(e){ return {getItem(){return null}, setItem(){}, removeItem(){}}; }
  })();

  const nav = document.getElementById('navbar');
  const setNavH = () => {
    const h = nav.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--nav-h', h + 'px');
  };
  setNavH();
  if (window.ResizeObserver){
    new ResizeObserver(setNavH).observe(nav);
  } else {
    window.addEventListener('resize', setNavH);
  }
  window.addEventListener('orientationchange', ()=>setTimeout(setNavH, 100));

  /* Footer auto-padding */
  function adjustFooterPadding(){
    const footer = document.querySelector("footer");
    const main = document.querySelector("main");
    if (footer && main){
      main.style.paddingBottom = footer.offsetHeight + "px";
    }
  }
  window.addEventListener("resize", adjustFooterPadding);
  window.addEventListener("load", adjustFooterPadding);
  if (window.ResizeObserver) {
    const footer = document.querySelector("footer");
    if (footer) {
      new ResizeObserver(adjustFooterPadding).observe(footer);
    }
  }
  adjustFooterPadding();

  const DURATION_SECONDS = 90; 
  const SECRET_MESSAGE = "In case you're starting to forget, know that you're loved in ways you might not always notice. It's not just in the words people say out loud, but in those secret glances, saved seats, and messages that check if you get home safely. You're the reason moments are lighter when you're in the room. Don't forget that sometimes, love reveals itself in the smallest, most precious details.";
  const SELF_DESTRUCT_TEXT = "message destroyed";
  const AFTER_TEXT = "— 62 7";

  const countdownTextEl = document.getElementById("countdownText");
  const countdownEl = document.getElementById("countdown");
  const messageEl = document.getElementById("message");
  const statusEl = document.getElementById("status");

  let progressBar = document.createElement("div");
  progressBar.style.height = "6px";
  progressBar.style.background = "red"; 
  progressBar.style.width = "100%";
  progressBar.style.transition = "width 1s linear";
  progressBar.style.marginTop = "8px";
  progressBar.style.borderRadius = "100px";
  countdownTextEl.appendChild(progressBar);

  const hashString = (str)=>{
    let h = 0x811c9dc5;
    for (const ch of str) {
      h ^= ch.codePointAt(0);
      h += (h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);
      h >>>= 0;
    }
    return ("00000000" + h.toString(16)).slice(-8);
  };
  const UNIQUE_KEY = "msg_" + hashString(SECRET_MESSAGE);

  function formatTime(sec){
    if(sec < 60) return `${sec}s`;
    let m = Math.floor(sec/60);
    let s = sec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }

  function showDestroyed(){
    countdownTextEl.style.display = "none";
    messageEl.textContent = "";
    statusEl.textContent = SELF_DESTRUCT_TEXT;
    const afterEl = document.createElement('span');
    afterEl.className = 'after-text';
    afterEl.textContent = AFTER_TEXT;
    statusEl.appendChild(afterEl);
  }

  if (safeStore.getItem(UNIQUE_KEY) === "true") {
    showDestroyed();
  } else {
    messageEl.textContent = SECRET_MESSAGE;
    let remaining = DURATION_SECONDS;
    countdownEl.textContent = formatTime(remaining);
    progressBar.style.width = "100%";

    const timer = setInterval(() => {
      remaining--;
      countdownEl.textContent = formatTime(remaining);
      let percent = (remaining / DURATION_SECONDS) * 100;
      progressBar.style.width = percent + "%";

      if (remaining <= 0) {
        clearInterval(timer);
        safeStore.setItem(UNIQUE_KEY, "true");
        showDestroyed();
      }
    }, 1000);
  }

  const sideMenu = document.getElementById("sideMenu");
  const menuBtn = document.getElementById("menuBtn");

  function updateMenuAria(open){
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    sideMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  const closeMenu = ()=>{ sideMenu.classList.remove("open"); updateMenuAria(false); };
  const openMenu = ()=>{ sideMenu.classList.add("open"); updateMenuAria(true); };

  menuBtn.addEventListener("click", ()=>{
    const willOpen = !sideMenu.classList.contains("open");
    if (willOpen) openMenu(); else closeMenu();
  });

  document.addEventListener("click", (e)=>{
    if (!sideMenu.classList.contains("open")) return;
    if (!sideMenu.contains(e.target) && e.target !== menuBtn) closeMenu();
  });

  document.addEventListener("keydown", (e)=>{
    if (e.key === "Escape"){
      closeMenu();
      closeAllModals();
    }
  });

  const navLinks = document.querySelectorAll(".side-menu a[data-page]");
  const sections = document.querySelectorAll("main section");
  let currentSectionId = "home";

  function showSection(id){
    sections.forEach(sec => sec.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) el.classList.add("active");
    navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("data-page")===id));
    currentSectionId = id;
    closeMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  navLinks.forEach(link=>{
    link.addEventListener("click",(e)=>{
      e.preventDefault();
      const page = link.getAttribute("data-page");
      if (page) showSection(page);
    });
  });

  function closeAllModals(){
    document.querySelectorAll(".modal").forEach(m => {
      m.setAttribute('aria-hidden','true');
      m.style.display = "none";
    });
    document.body.classList.remove('no-scroll');
    document.getElementById('faqBtn').setAttribute('aria-expanded','false');
  }
  function openModal(id){
    closeAllModals();
    const m = document.getElementById(id);
    if (!m) return;
    m.style.display = "block";
    m.setAttribute('aria-hidden','false');
    document.body.classList.add('no-scroll');
    const focusTarget = m.querySelector('.modal-content');
    if (focusTarget) focusTarget.focus();
  }

  document.querySelectorAll("[data-modal]").forEach(btn=>{
    btn.addEventListener("click",(e)=>{
      e.preventDefault();
      const id = btn.getAttribute("data-modal");
      if (id) openModal(id);
      closeMenu();
    });
  });
  document.querySelectorAll(".close").forEach(x=>{
    x.addEventListener("click", ()=>{
      const id = x.getAttribute("data-close");
      if (id){
        const m = document.getElementById(id);
        if (m){ m.style.display = "none"; m.setAttribute('aria-hidden','true'); }
      } else {
          closeAllModals();
      }
      document.body.classList.remove('no-scroll');
      document.getElementById('faqBtn').setAttribute('aria-expanded','false');
    });
  });
  window.addEventListener("click",(e)=>{
    if (e.target.classList && e.target.classList.contains("modal")){
      e.target.style.display = "none";
      e.target.setAttribute('aria-hidden','true');
      document.body.classList.remove('no-scroll');
      document.getElementById('faqBtn').setAttribute('aria-expanded','false');
    }
  });

  const faqBtn = document.getElementById('faqBtn');
  const faqModal = document.getElementById('faqModal');
  const faqBody = document.getElementById('faqModalBody');

  function injectFaqForPage(pageId){
    faqBody.innerHTML = ""; 
    let tplId = null;

    if (pageId === "toLouis") tplId = "faqLouisTpl";
    else if (pageId === "anonymous") tplId = "faqAnonTpl";
    else {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <h2 style="margin-bottom:10px">FAQ</h2>
        <p class="muted">Switch to <strong>To: Louis</strong> or <strong>Send Anonymous Message</strong> to see page-specific FAQs.</p>
      `;
      faqBody.appendChild(wrapper);
    }

    if (tplId){
      const tpl = document.getElementById(tplId);
      if (tpl){
        faqBody.appendChild(tpl.content.cloneNode(true));
      }
    }
    faqBody.querySelectorAll(".faq-item").forEach(wireFaqItem);
  }

  faqBtn.addEventListener('click', ()=>{
    injectFaqForPage(currentSectionId);
    openModal('faqModal');
    faqBtn.setAttribute('aria-expanded','true');
  });

  function wireFaqItem(item){
    const q = item.querySelector(".faq-question");
    const a = item.querySelector(".faq-answer");
    if (!q || !a) return;
    const toggle = ()=>{
      const isOpen = item.classList.contains("open");
      if (isOpen){
        a.style.maxHeight = a.scrollHeight + "px";
        requestAnimationFrame(()=>{ a.style.maxHeight = "0px"; });
        item.classList.remove("open");
        q.setAttribute('aria-expanded','false');
      } else {
        item.classList.add("open");
        q.setAttribute('aria-expanded','true');
        a.style.maxHeight = a.scrollHeight + "px";
        const tidy = ()=>{ if(item.classList.contains("open")) a.style.maxHeight = "none"; };
        a.addEventListener("transitionend", tidy, { once:true });
      }
    };
    q.addEventListener("click", toggle);
    q.addEventListener("keydown", (ev)=>{
      if (ev.key === "Enter" || ev.key === " "){ ev.preventDefault(); toggle(); }
    });
  }

  async function handleFormSubmit(form, resultEl){
    resultEl.style.color = "#6b7280";
    resultEl.textContent = "Sending…";

    if (form.id === "msgFormAnon") {
      const recipient = form.querySelector("#recipientAnon");
      const message = form.querySelector("#messageAnon");

      recipient.classList.remove("error");
      message.classList.remove("error");

      if (!recipient.value.trim()) {
        recipient.classList.add("error");
        recipient.focus();
        resultEl.style.color = "red";
        resultEl.textContent = "Recipient link is required.";
        return;
      }
      if (!message.value.trim()) {
        message.classList.add("error");
        message.focus();
        resultEl.style.color = "red";
        resultEl.textContent = "Message is required.";
        return;
      }
    } else {
      const required = form.querySelectorAll("[required]");
      for (const r of required){
        r.classList.remove("error");
        if (!r.value.trim()){
          r.classList.add("error");
          r.focus();
          resultEl.style.color = "red";
          resultEl.textContent = "Please fill out the required field(s).";
          return;
        }
      }
    }

    if (!form.action || form.getAttribute("action")===""){
      resultEl.style.color = "#b45309";
      const data = new FormData(form);
      const obj = {};
      data.forEach((v,k)=>{ obj[k]=v; });
      resultEl.innerHTML = `⚠️ <strong>Can't send yet. Fixing soon.</strong>`;
      return;
    }

    try{
      const response = await fetch(form.action, {
        method: (form.method || "POST").toUpperCase(),
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok){
        resultEl.style.color = "green";
        resultEl.textContent = "Message sent successfully!";
        form.reset();
      }else{
        let msg = "Oops! Something went wrong.";
        try{
          const j = await response.json();
          if (j && (j.error || j.message)) msg = j.error || j.message;
        }catch(_){}
        resultEl.style.color = "red";
        resultEl.textContent = msg;
      }
    }catch(err){
      resultEl.style.color = "red";
      resultEl.textContent = "Network error. Please try again.";
    }
  }

  const formLouis = document.getElementById("msgFormLouis");
  const resLouis = document.getElementById("formResultLouis");
  if (formLouis && resLouis){
    formLouis.addEventListener("submit", (e)=>{
      e.preventDefault();
      handleFormSubmit(formLouis, resLouis);
    });
  }
  const formAnon = document.getElementById("msgFormAnon");
  const resAnon = document.getElementById("formResultAnon");
  if (formAnon && resAnon){
    formAnon.addEventListener("submit", (e)=>{
      e.preventDefault();
      handleFormSubmit(formAnon, resAnon);
    });
  }

  const HASH_TO_SECTION = { home:"home", louis:"toLouis", tolouis:"toLouis", anonymous:"anonymous" };
  const HASH_TO_MODAL = { about:"aboutModal", contact:"contactModal" };
  function handleHash(){
    let h = (location.hash || "").replace(/^#/, "").toLowerCase();
    if (!h) return;
    if (HASH_TO_SECTION[h]) showSection(HASH_TO_SECTION[h]);
    else if (HASH_TO_MODAL[h]) openModal(HASH_TO_MODAL[h]);
  }
  window.addEventListener("hashchange", handleHash);
  handleHash();

  let dirty = false;
  document.addEventListener("input", (e)=>{
    if (e.target.closest("form")) dirty = true;
  });
  window.addEventListener("beforeunload", (e)=>{
    if (!dirty) return;
    e.preventDefault();
    e.returnValue = "";
  });

})();