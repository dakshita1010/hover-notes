// HoverNotes Renderer Logic
document.addEventListener('DOMContentLoaded', async () => {
  // UI Elements
  const noteEditor = document.getElementById('noteEditor');
  const tabsContainer = document.getElementById('tabsContainer');
  const addNoteBtn = document.getElementById('addNoteBtn');
  const deleteNoteBtn = document.getElementById('deleteNoteBtn');
  const ghostBtn = document.getElementById('ghostBtn');
  const pinBtn = document.getElementById('pinBtn');
  const opacityBtn = document.getElementById('opacityBtn');
  const opacityPopup = document.getElementById('opacityPopup');
  const opacitySlider = document.getElementById('opacitySlider');
  const opacityVal = document.getElementById('opacityVal');
  const collapseBtn = document.getElementById('collapseBtn');
  const collapseIcon = document.getElementById('collapseIcon');
  const hideBtn = document.getElementById('hideBtn');
  const ghostBanner = document.getElementById('ghostBanner');
  const mainBody = document.getElementById('mainBody');
  const collapsedBar = document.getElementById('collapsedBar');
  const collapsedSummary = document.getElementById('collapsedSummary');
  const saveStatusText = document.getElementById('saveStatusText');
  const statusDot = document.querySelector('.status-dot');
  const wordCount = document.getElementById('wordCount');
  const charCount = document.getElementById('charCount');
  const todoBtn = document.getElementById('todoBtn');
  const bulletBtn = document.getElementById('bulletBtn');
  const timestampBtn = document.getElementById('timestampBtn');
  const copyBtn = document.getElementById('copyBtn');

  // Application State
  let notes = [];
  let activeNoteId = null;
  let isGhost = false;
  let isPinned = true;
  let isCollapsed = false;
  let saveTimeout = null;

  // Default initial note template
  const defaultNotes = [
    {
      id: 'note_' + Date.now(),
      title: 'Quick Note',
      content: `Welcome to HoverNotes! ✨\n\n📌 Stays on top of your browser or apps without disturbing you.\n\n👻 Ghost Mode (Alt+Shift+G):\nMakes the note click-through so you can click links and video underneath while reading!\n\n👁️ Opacity:\nUse the circle icon above to adjust transparency.\n\n⌨️ Shortcuts:\n• Alt+Shift+N: Show / Hide anytime\n• Alt+Shift+G: Toggle Ghost Mode\n\n[ ] Try writing your to-dos here\n[x] Check them off when completed!`,
      updatedAt: Date.now()
    }
  ];

  // Load notes from storage
  try {
    const savedData = await window.api.loadNotes();
    if (savedData && Array.isArray(savedData.notes) && savedData.notes.length > 0) {
      notes = savedData.notes;
      activeNoteId = savedData.activeNoteId || notes[0].id;
    } else {
      notes = defaultNotes;
      activeNoteId = notes[0].id;
    }
  } catch (err) {
    console.error('Failed to load notes:', err);
    notes = defaultNotes;
    activeNoteId = notes[0].id;
  }

  // Render Tabs
  function renderTabs() {
    tabsContainer.innerHTML = '';
    notes.forEach((note) => {
      const tab = document.createElement('div');
      tab.className = `tab-item ${note.id === activeNoteId ? 'active' : ''}`;
      tab.textContent = note.title || 'Untitled';
      tab.title = 'Click to view. Double-click to rename.';

      tab.addEventListener('click', () => {
        if (activeNoteId !== note.id) {
          switchNote(note.id);
        }
      });

      // Double-click to rename note title
      tab.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const currentTitle = note.title;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentTitle;
        input.className = 'tab-rename-input';
        input.style.width = '80px';
        input.style.background = '#1e2436';
        input.style.color = '#fff';
        input.style.border = '1px solid #6366f1';
        input.style.borderRadius = '4px';
        input.style.padding = '2px 4px';
        input.style.fontSize = '11px';

        tab.textContent = '';
        tab.appendChild(input);
        input.focus();
        input.select();

        const saveNewTitle = () => {
          const newTitle = input.value.trim() || currentTitle;
          note.title = newTitle;
          renderTabs();
          queueSave();
        };

        input.addEventListener('blur', saveNewTitle);
        input.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') saveNewTitle();
          if (ev.key === 'Escape') renderTabs();
        });
      });

      tabsContainer.appendChild(tab);
    });

    updateSummary();
  }

  function getActiveNote() {
    return notes.find((n) => n.id === activeNoteId) || notes[0];
  }

  function switchNote(id) {
    activeNoteId = id;
    const current = getActiveNote();
    noteEditor.value = current.content;
    renderTabs();
    updateStats();
  }

  function updateStats() {
    const text = noteEditor.value;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    charCount.textContent = `${chars} chars`;
    wordCount.textContent = `${words} words`;
  }

  function updateSummary() {
    const current = getActiveNote();
    collapsedSummary.textContent = `${current ? current.title : 'HoverNotes'} (${notes.length} note${notes.length > 1 ? 's' : ''})`;
  }

  // Auto-Save Debounced
  function queueSave() {
    statusDot.className = 'status-dot saving';
    saveStatusText.textContent = 'Saving...';

    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      const current = getActiveNote();
      if (current) {
        current.content = noteEditor.value;
        current.updatedAt = Date.now();
      }

      await window.api.saveNotes({
        notes,
        activeNoteId
      });

      statusDot.className = 'status-dot';
      saveStatusText.textContent = 'Saved';
      updateSummary();
    }, 400);
  }

  // Note Editor Input
  noteEditor.addEventListener('input', () => {
    updateStats();
    queueSave();
  });

  // Tab key indentation
  noteEditor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = noteEditor.selectionStart;
      const end = noteEditor.selectionEnd;
      noteEditor.value = noteEditor.value.substring(0, start) + '  ' + noteEditor.value.substring(end);
      noteEditor.selectionStart = noteEditor.selectionEnd = start + 2;
      queueSave();
    }
  });

  // Add Note Button
  addNoteBtn.addEventListener('click', () => {
    const newId = 'note_' + Date.now();
    const newNote = {
      id: newId,
      title: `Note ${notes.length + 1}`,
      content: '',
      updatedAt: Date.now()
    };
    notes.push(newNote);
    switchNote(newId);
    noteEditor.focus();
    queueSave();
  });

  // Delete Note Button
  deleteNoteBtn.addEventListener('click', () => {
    if (notes.length <= 1) {
      if (confirm('Clear the content of this note?')) {
        noteEditor.value = '';
        const cur = getActiveNote();
        cur.content = '';
        cur.title = 'Quick Note';
        renderTabs();
        updateStats();
        queueSave();
      }
      return;
    }

    if (confirm(`Delete "${getActiveNote().title}"?`)) {
      notes = notes.filter((n) => n.id !== activeNoteId);
      activeNoteId = notes[0].id;
      switchNote(activeNoteId);
      queueSave();
    }
  });

  // Toolbar Actions
  function insertAtCursor(text) {
    const start = noteEditor.selectionStart;
    const end = noteEditor.selectionEnd;
    const val = noteEditor.value;
    noteEditor.value = val.substring(0, start) + text + val.substring(end);
    noteEditor.selectionStart = noteEditor.selectionEnd = start + text.length;
    noteEditor.focus();
    updateStats();
    queueSave();
  }

  todoBtn.addEventListener('click', () => insertAtCursor('[ ] '));
  bulletBtn.addEventListener('click', () => insertAtCursor('• '));
  timestampBtn.addEventListener('click', () => {
    const now = new Date();
    const dateStr = `[${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] `;
    insertAtCursor(dateStr);
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(noteEditor.value);
      const prevText = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => {
        copyBtn.textContent = prevText;
      }, 1500);
    } catch (err) {
      console.error('Clipboard copy error:', err);
    }
  });

  // Window Controls: Always on Top (Pin)
  pinBtn.addEventListener('click', () => {
    isPinned = !isPinned;
    window.api.togglePin(isPinned);
    pinBtn.classList.toggle('active', isPinned);
  });

  // Ghost Mode (Click-Through)
  function updateGhostUI(active) {
    isGhost = active;
    ghostBtn.classList.toggle('active', isGhost);
    ghostBanner.classList.toggle('hidden', !isGhost);
  }

  ghostBtn.addEventListener('click', () => {
    isGhost = !isGhost;
    window.api.setGhostMode(isGhost);
    updateGhostUI(isGhost);
  });

  // Opacity Controls
  opacityBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    opacityPopup.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!opacityPopup.contains(e.target) && e.target !== opacityBtn) {
      opacityPopup.classList.add('hidden');
    }
  });

  opacitySlider.addEventListener('input', (e) => {
    const val = e.target.value;
    opacityVal.textContent = `${val}%`;
    window.api.setOpacity(val / 100);
  });

  // Collapse / Mini-Pill Mode
  function setCollapsedState(collapsed) {
    isCollapsed = collapsed;
    window.api.toggleCollapse(isCollapsed);

    if (isCollapsed) {
      mainBody.style.display = 'none';
      collapsedBar.classList.remove('hidden');
      collapseIcon.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';
      collapseBtn.title = 'Expand note';
    } else {
      mainBody.style.display = 'flex';
      collapsedBar.classList.add('hidden');
      collapseIcon.innerHTML = '<polyline points="18 15 12 9 6 15"></polyline>';
      collapseBtn.title = 'Collapse note';
    }
  }

  collapseBtn.addEventListener('click', () => setCollapsedState(!isCollapsed));
  collapsedBar.addEventListener('click', () => setCollapsedState(false));

  // Hide / Minimize to Tray
  hideBtn.addEventListener('click', () => {
    window.api.hideWindow();
  });

  // Main process listeners
  window.api.onGhostModeChanged((val) => {
    updateGhostUI(val);
  });

  window.api.onPinStatusChanged((val) => {
    isPinned = val;
    pinBtn.classList.toggle('active', isPinned);
  });

  // Initial load
  renderTabs();
  const current = getActiveNote();
  if (current) {
    noteEditor.value = current.content;
    updateStats();
  }
});
