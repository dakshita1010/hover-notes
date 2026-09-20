**HoverNotes**

A lightweight, always-on-top desktop notes application for Windows with global hotkeys, click-through interaction, adjustable transparency, multi-note management, and persistent local storage.

HoverNotes is a productivity-focused desktop utility that keeps important notes, instructions, checklists, and reference material visible while you work in other applications.

Unlike conventional note-taking applications that require constant window switching, HoverNotes provides a persistent floating workspace that can remain above browsers, IDEs, video players, terminals, and other desktop applications.

---

**Key Features**

**Always-On-Top Floating Window**

* Keeps the notes interface above other desktop applications.
* Designed for multitasking without repeatedly switching between windows.
* Useful for coding references, task lists, documentation, study material, and workflows.

**Ghost / Click-Through Mode**

* Toggle using Alt + Shift + G.
* Allows mouse interactions to pass through the notes window to applications underneath.
* Enables users to keep reference information visible without blocking interaction with the underlying application.

**Dynamic Window Transparency**

* Adjustable opacity from 20% to 100%.
* Provides flexible visibility while working with content behind the notes window.
* Allows the widget to behave as either a fully readable note panel or a subtle overlay.

**Quick Editor Toolbar**

HoverNotes includes a lightweight quick-action toolbar that speeds up common note-taking tasks:
Tool	Function
* Checkbox	Instantly inserts [ ] for creating to-do items
* List	Inserts bullet points for structured notes
* Timestamp	Inserts the current date and time
* Copy	Copies the current note content directly to the clipboard

**Global Keyboard Shortcuts**

* Alt + Shift + N toggles HoverNotes visibility from anywhere in Windows.
* Alt + Shift + G toggles Ghost Mode.
* Shortcuts enable fast interaction without requiring mouse navigation.

**Multi-Note Workspace**

* Supports multiple notes through a tab-based interface.
* Notes can be renamed by double-clicking their tabs.
* Lets users organize tasks, projects, references, or checklists independently.

**Persistent Local Storage**

* Automatically saves changes locally.
* Notes persist between application sessions.
* Eliminates the need for manual save operations or external cloud services.

**Collapsible Mini-Dock**

* Converts the full notes interface into a compact floating dock.
* Reduces screen usage when the complete editor is not required.
* Can remain accessible while working with other applications.

**System Tray Integration**

* Runs unobtrusively in the Windows system tray.
* Allows the application to remain available without occupying the taskbar.
* Supports a lightweight background workflow.

---

**Technical Highlights**

HoverNotes demonstrates several desktop-application engineering concepts:

* Window management and always-on-top behavior
* Global keyboard shortcut registration
* Mouse event interception and click-through windows
* Dynamic window opacity control
* Multi-window/tab state management
* Local persistent data storage
* System tray integration
* Keyboard-driven application control
* Desktop UI/UX optimization
* Cross-application multitasking

The application is designed around a lightweight architecture so that its core functionality remains available without requiring users to keep a browser tab or large productivity application open.

---

**Core Interaction Model**

                    ┌───────────────────────┐
                    │      HoverNotes       │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
       Window Manager     Input Manager     Note Manager
              │                 │                 │
       ┌──────┴──────┐    ┌─────┴─────┐    ┌──────┴──────┐
       │ Always Top  │    │ Global    │    │ Multi-Note  │
       │ Opacity     │    │ Hotkeys   │    │ Auto-Save   │
       │ Mini-Dock   │    │ Ghost     │    │ Rename      │
       └─────────────┘    └───────────┘    └─────────────┘
                                │
                                ▼
                         Windows Desktop

---

**Design Goal**s

HoverNotes was developed around four primary goals:

**1. Minimal Disruption**

Keep frequently referenced information available without forcing users to repeatedly switch applications.

**2. Keyboard-First Interaction**

Global shortcuts provide rapid access to the application while keeping the user’s hands on the keyboard.

**3. Flexible Desktop Integration**

The floating interface is designed to coexist with existing workflows rather than replacing them.

**4. Local-First Persistence**

Notes are stored locally, providing fast access and eliminating unnecessary dependency on external services for basic note-taking.

---

**Keyboard Shortcuts**

Column 1	Column 2
Shortcut	Function
Alt + Shift + N	Toggle HoverNotes visibility
Alt + Shift + G	Toggle Ghost / Click-Through Mode
Tab	Indent text by 2 spaces in the editor


---

**Getting Started**

**Prerequisites**

Make sure the following are installed:

* Node.js
* npm
* Windows OS

**Installation**

Clone the repository:

git clone <repository-url>
cd HoverNotes

**Install dependencies:**

npm install

**Run the Application**

Using npm:

npm start

Or launch directly using:

run-hovernotes.bat

---

**Example Use Cases**

HoverNotes can be used for:

* Keeping study notes visible while watching lectures.
* Referencing documentation while coding
* Maintaining debugging checklists while troubleshooting
* Keeping task lists visible during development
* Referencing instructions while working in a browser
* Taking notes while watching videos
* Keeping cybersecurity commands or investigation checklists accessible during labs

---

**Engineering Value**

This project demonstrates practical experience beyond conventional CRUD applications by interacting directly with the desktop environment and operating-system-level window behavior.

**Key engineering challenges addressed include:**

* Maintaining an always-on-top application without disrupting other windows.
* Implementing global keyboard shortcuts outside the application’s active window.
* Dynamically changing mouse interaction behavior through Ghost Mode.
* Managing transparent floating UI elements.
* Persisting multiple independent notes locally.
* Balancing accessibility with minimal screen-space usage.

These features make HoverNotes a practical demonstration of desktop application development, event-driven programming, UI engineering, state management, and Windows integration.

---

**Project Highlights**

**Project Type:** Desktop Productivity Application
**Platform:** Windows
**Architecture:** Event-driven desktop application
**Storage:** Local persistent storage
**Interaction:** Mouse + Keyboard + Global Hotkeys
**Primary Focus:** Desktop UI, window management, productivity, local persistence

---

**Skills Demonstrated**

Desktop Application Development · UI/UX Engineering · Event-Driven Programming · Window Management · Global Hotkeys · Local Data Persistence · State Management · Windows Integration · JavaScript/Node.js · Software Design

---
