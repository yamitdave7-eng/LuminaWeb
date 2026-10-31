import os

app_path = r"c:\Users\USER\OneDrive\Documents\LuminaWebsiteFlask\app.js"

with open(app_path, "r", encoding="utf-8") as f:
    code = f.read()

start_marker = "  initQuiz() {"
end_marker = "  /* Full Zen Focus Chamber & Ambient Sound */"

start_idx = code.find(start_marker)
end_idx = code.find(end_marker)

if start_idx == -1 or end_idx == -1:
    raise Exception(f"Markers not found: start_idx={start_idx}, end_idx={end_idx}")

new_quiz_logic = '''  initQuiz() {
    const defaultDeck = {
      deck_title: "Computer Science & Study Skills",
      type: "Built-in Deck",
      flashcards: [
        {
          id: 1,
          front: "What is the average-case time complexity of Hash Table lookups?",
          tag: "Computer Science",
          highlight: "O(1) Constant Time",
          back: "Hash tables compute an index via hashing function, allowing immediate array indexing on average."
        },
        {
          id: 2,
          front: "What is the Pomodoro technique's recommended study interval?",
          tag: "Study Skills",
          highlight: "25 Minutes Focus + 5 Minutes Rest",
          back: "25 minutes of deep focus followed by 5 minutes of mindful rest prevents cognitive fatigue and improves retention."
        },
        {
          id: 3,
          front: "How does Spaced Repetition halt memory decay?",
          tag: "Cognitive Science",
          highlight: "Calibrated Intervals at the Forgetting Curve",
          back: "By reviewing material right as you are about to forget it, neural synapses reinforce the memory trace permanently."
        },
        {
          id: 4,
          front: "What is the Habify 40/30/30 daily balance formula?",
          tag: "Wellness & Habit",
          highlight: "40% Study · 30% Mind · 30% Body",
          back: "Allocating 40% to deep study, 30% to mental calm/mindfulness, and 30% to physical health prevents student burnout."
        },
        {
          id: 5,
          front: "In Python, what is the key difference between a List and a Tuple?",
          tag: "Python & Coding",
          highlight: "Lists are Mutable, Tuples are Immutable",
          back: "Lists can be modified after creation (append/pop), whereas tuples are fixed and cannot be changed."
        }
      ],
      quiz: [
        {
          id: 1,
          question: "In Big-O notation, what is the average-case time complexity of looking up an item in a Hash Table?",
          options: ["A. O(n)", "B. O(1) Constant Time", "C. O(log n)", "D. O(n²)"],
          correct_answer: "B. O(1) Constant Time",
          explanation: "Hash tables compute an index in constant time O(1) on average."
        },
        {
          id: 2,
          question: "Which interval length is standard for a deep work Pomodoro focus session?",
          options: ["A. 10 minutes", "B. 25 minutes", "C. 90 minutes", "D. 3 hours"],
          correct_answer: "B. 25 minutes",
          explanation: "25 minutes of deep focus followed by a 5-minute break is the classic Pomodoro rhythm."
        },
        {
          id: 3,
          question: "What is the primary benefit of the 'Spaced Repetition' learning technique?",
          options: ["A. Cramming everything in one night", "B. Halting memory decay by reviewing at calibrated intervals", "C. Memorizing words without understanding", "D. Studying only once per semester"],
          correct_answer: "B. Halting memory decay by reviewing at calibrated intervals",
          explanation: "Spaced repetition reviews material right before the forgetting curve takes effect."
        },
        {
          id: 4,
          question: "According to the LuminaEdu daily balance wheel, what percentage is allocated to deep Study?",
          options: ["A. 100%", "B. 70%", "C. 40%", "D. 10%"],
          correct_answer: "C. 40%",
          explanation: "40% Study, 30% Mind wellness, and 30% Body health creates sustainable peak performance."
        },
        {
          id: 5,
          question: "In Python, which built-in function returns both the index and value of iterable elements?",
          options: ["A. range()", "B. enumerate()", "C. zip()", "D. map()"],
          correct_answer: "B. enumerate()",
          explanation: "enumerate(iterable) produces tuples of (index, item)."
        }
      ]
    };

    function getSavedDeck() {
      try {
        const saved = localStorage.getItem('lumina_active_study_set_v2');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return defaultDeck;
    }

    this.activeDeck = getSavedDeck();
    this.currentQuizIdx = 0;
    this.quizScore = 0;
    this.quizCorrectCount = 0;
    this.quizStreak = 1.0;
    this.maxStreak = 1.0;
    this.hasAnswered = false;
    this.currentCardIdx = 0;
    this.currentCardsList = [...this.activeDeck.flashcards];

    const quizModeBtn = document.getElementById('quizModeBtn');
    const flashcardModeBtn = document.getElementById('flashcardModeBtn');
    const generatorModeBtn = document.getElementById('generatorModeBtn');
    const quickUploadPillBtn = document.getElementById('quickUploadPillBtn');
    const quizView = document.getElementById('quizContainerView');
    const summaryView = document.getElementById('quizSummaryView');
    const flashcardView = document.getElementById('flashcardContainerView');
    const generatorView = document.getElementById('quizGeneratorView');

    const switchView = (mode) => {
      [quizModeBtn, flashcardModeBtn, generatorModeBtn].forEach(b => b?.classList.remove('active'));
      if (quizView) quizView.style.display = 'none';
      if (summaryView) summaryView.style.display = 'none';
      if (flashcardView) flashcardView.style.display = 'none';
      if (generatorView) generatorView.style.display = 'none';

      if (mode === 'quiz') {
        quizModeBtn?.classList.add('active');
        if (this.currentQuizIdx >= this.activeDeck.quiz.length) {
          if (summaryView) summaryView.style.display = 'block';
        } else {
          if (quizView) quizView.style.display = 'block';
          this.renderQuizQuestion();
        }
      } else if (mode === 'flashcards') {
        flashcardModeBtn?.classList.add('active');
        if (flashcardView) flashcardView.style.display = 'block';
        this.renderFlashcard(this.currentCardIdx);
      } else if (mode === 'generator') {
        generatorModeBtn?.classList.add('active');
        if (generatorView) generatorView.style.display = 'flex';
      }
      this.updateDeckRibbon();
    };

    if (quizModeBtn) quizModeBtn.addEventListener('click', () => switchView('quiz'));
    if (flashcardModeBtn) flashcardModeBtn.addEventListener('click', () => switchView('flashcards'));
    if (generatorModeBtn) generatorModeBtn.addEventListener('click', () => switchView('generator'));
    if (quickUploadPillBtn) quickUploadPillBtn.addEventListener('click', () => switchView('generator'));

    // Flashcard listeners
    const flashcardInner = document.getElementById('flashcardInner');
    const cardPrevBtn = document.getElementById('cardPrevBtn');
    const cardNextBtn = document.getElementById('cardNextBtn');
    const shuffleCardsBtn = document.getElementById('shuffleCardsBtn');

    if (flashcardInner) {
      flashcardInner.addEventListener('click', () => flashcardInner.classList.toggle('flipped'));
    }
    if (cardPrevBtn) {
      cardPrevBtn.addEventListener('click', () => {
        if (!this.currentCardsList.length) return;
        this.currentCardIdx = (this.currentCardIdx - 1 + this.currentCardsList.length) % this.currentCardsList.length;
        this.renderFlashcard(this.currentCardIdx);
      });
    }
    if (cardNextBtn) {
      cardNextBtn.addEventListener('click', () => {
        if (!this.currentCardsList.length) return;
        this.currentCardIdx = (this.currentCardIdx + 1) % this.currentCardsList.length;
        this.renderFlashcard(this.currentCardIdx);
      });
    }
    if (shuffleCardsBtn) {
      shuffleCardsBtn.addEventListener('click', () => {
        this.currentCardsList.sort(() => Math.random() - 0.5);
        this.renderFlashcard(0);
        if (this.confetti) this.confetti.fire();
      });
    }

    // Quiz Navigation
    const nextBtn = document.getElementById('quizNextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const total = this.activeDeck.quiz.length;
        if (this.currentQuizIdx < total - 1) {
          this.currentQuizIdx++;
          this.renderQuizQuestion();
        } else {
          this.showQuizSummary();
        }
      });
    }

    document.getElementById('retakeQuizBtn')?.addEventListener('click', () => this.resetQuiz());
    document.getElementById('studyCardsAfterQuizBtn')?.addEventListener('click', () => switchView('flashcards'));
    document.getElementById('uploadAnotherLessonBtn')?.addEventListener('click', () => switchView('generator'));

    // Generator elements
    this.initGenerator();

    this.resetQuiz();
    this.renderFlashcard(0);
    this.updateDeckRibbon();
  }

  updateDeckRibbon() {
    const titleEl = document.getElementById('activeDeckTitle');
    const tagEl = document.getElementById('activeDeckTypeTag');
    const scoreValEl = document.getElementById('ribbonScoreVal');
    const streakValEl = document.getElementById('ribbonStreakVal');

    if (titleEl && this.activeDeck) titleEl.textContent = this.activeDeck.deck_title || 'Study Deck';
    if (tagEl && this.activeDeck) tagEl.textContent = this.activeDeck.type || 'Custom Deck';
    if (scoreValEl) scoreValEl.textContent = `${this.quizScore} pts`;
    if (streakValEl) streakValEl.textContent = `· ${this.quizStreak.toFixed(1)}x Streak`;
  }

  renderFlashcard(idx) {
    this.currentCardIdx = idx;
    const inner = document.getElementById('flashcardInner');
    if (inner) inner.classList.remove('flipped');
    const card = this.currentCardsList[this.currentCardIdx];
    const frontEl = document.getElementById('cardFrontText');
    const tagEl = document.getElementById('cardCategoryTag');
    const highlightEl = document.getElementById('cardHighlightText');
    const explEl = document.getElementById('cardExplanationText');
    const counterEl = document.getElementById('cardCounter');

    if (frontEl && card) frontEl.textContent = card.front;
    if (tagEl && card) tagEl.textContent = card.tag || this.activeDeck?.deck_title || 'Core Concept';
    if (highlightEl && card) highlightEl.textContent = card.highlight || card.front.replace(/^What is\\s*/i, '').replace(/\\?$/, '');
    if (explEl && card) explEl.textContent = card.back;
    if (counterEl && this.currentCardsList) counterEl.textContent = `Card ${this.currentCardIdx + 1} / ${this.currentCardsList.length}`;
  }

  resetQuiz() {
    this.currentQuizIdx = 0;
    this.quizScore = 0;
    this.quizCorrectCount = 0;
    this.quizStreak = 1.0;
    this.maxStreak = 1.0;
    this.currentCardsList = [...(this.activeDeck?.flashcards || [])];
    const quizView = document.getElementById('quizContainerView');
    const summaryView = document.getElementById('quizSummaryView');
    if (summaryView) summaryView.style.display = 'none';
    if (quizView) quizView.style.display = 'block';
    this.renderQuizQuestion();
    this.updateDeckRibbon();
  }

  renderQuizQuestion() {
    this.hasAnswered = false;
    const qEl = document.getElementById('quizQuestionText');
    const optsEl = document.getElementById('quizOptionsList');
    const explCard = document.getElementById('quizExplanationCard');
    const nextBtn = document.getElementById('quizNextBtn');
    const progEl = document.getElementById('quizProgressFill');
    const trackerEl = document.getElementById('questionTracker');
    const liveStreak = document.getElementById('liveStreakPill');
    const liveScore = document.getElementById('liveScorePill');

    if (nextBtn) nextBtn.style.display = 'none';
    if (explCard) explCard.style.display = 'none';

    const total = this.activeDeck?.quiz?.length || 0;
    if (total === 0) return;

    const q = this.activeDeck.quiz[this.currentQuizIdx];
    if (!q) return;

    if (qEl) qEl.textContent = q.question;
    if (trackerEl) trackerEl.textContent = `Question ${this.currentQuizIdx + 1} of ${total}`;
    if (liveStreak) liveStreak.textContent = `🔥 Streak: ${this.quizStreak.toFixed(1)}x (+${Math.round(100 * (this.quizStreak - 1))} bonus)`;
    if (liveScore) liveScore.textContent = `🏆 ${this.quizScore} Points`;
    this.updateDeckRibbon();

    if (progEl) {
      progEl.style.width = `${((this.currentQuizIdx + 1) / total) * 100}%`;
    }

    if (optsEl) {
      optsEl.innerHTML = '';
      q.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-opt-btn';
        btn.textContent = opt;

        btn.addEventListener('click', () => {
          if (this.hasAnswered) return;
          this.hasAnswered = true;

          const isCorrect = (opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) ||
                            (q.correct_answer.toLowerCase().includes(opt.toLowerCase())) ||
                            (opt.toLowerCase().includes(q.correct_answer.toLowerCase()));

          if (isCorrect) {
            btn.classList.add('correct');
            const wonPts = Math.round(100 * this.quizStreak);
            this.quizScore += wonPts;
            this.quizCorrectCount++;
            this.quizStreak += 0.5;
            if (this.quizStreak > this.maxStreak) this.maxStreak = this.quizStreak;

            if (explCard) {
              explCard.className = 'quiz-explanation-card correct-expl';
              document.getElementById('explIcon').textContent = '✓';
              document.getElementById('explTitle').textContent = 'Correct Answer!';
              document.getElementById('explPointsTag').textContent = `+${wonPts} pts!`;
              document.getElementById('quizExplanationText').textContent = q.explanation || 'Grounded conceptual recall confirmed.';
              explCard.style.display = 'block';
            }
            if (this.confetti) this.confetti.fire();
          } else {
            btn.classList.add('wrong');
            this.quizStreak = 1.0;

            Array.from(optsEl.children).forEach(child => {
              if (child.textContent.trim().toLowerCase() === q.correct_answer.trim().toLowerCase() ||
                  q.correct_answer.toLowerCase().includes(child.textContent.toLowerCase()) ||
                  child.textContent.toLowerCase().includes(q.correct_answer.toLowerCase())) {
                child.classList.add('correct');
              }
            });

            if (explCard) {
              explCard.className = 'quiz-explanation-card wrong-expl';
              document.getElementById('explIcon').textContent = '✕';
              document.getElementById('explTitle').textContent = 'Not quite right';
              document.getElementById('explPointsTag').textContent = '+0 pts';
              document.getElementById('quizExplanationText').textContent = q.explanation || `The correct answer was: ${q.correct_answer}`;
              explCard.style.display = 'block';
            }
          }

          if (liveStreak) liveStreak.textContent = `🔥 Streak: ${this.quizStreak.toFixed(1)}x`;
          if (liveScore) liveScore.textContent = `🏆 ${this.quizScore} Points`;
          this.updateDeckRibbon();

          if (nextBtn) {
            nextBtn.style.display = 'inline-block';
            nextBtn.textContent = this.currentQuizIdx < total - 1 ? 'Next Question →' : 'Finish Quiz & View Points Report 🏆';
          }
        });

        optsEl.appendChild(btn);
      });
    }
  }

  showQuizSummary() {
    const quizView = document.getElementById('quizContainerView');
    const summaryView = document.getElementById('quizSummaryView');
    if (quizView) quizView.style.display = 'none';
    if (summaryView) summaryView.style.display = 'block';

    const total = this.activeDeck.quiz.length;
    const accuracy = total > 0 ? Math.round((this.quizCorrectCount / total) * 100) : 0;
    const basePts = this.quizCorrectCount * 100;
    const streakBonus = Math.max(0, this.quizScore - basePts);

    document.getElementById('summaryTotalPoints').textContent = `⭐ ${this.quizScore} Points Earned!`;
    document.getElementById('summaryAccuracyVal').textContent = `${accuracy}%`;
    document.getElementById('summaryBasePtsVal').textContent = `${basePts}`;
    document.getElementById('summaryStreakBonusVal').textContent = `+${streakBonus}`;
    document.getElementById('summaryCorrectCountVal').textContent = `${this.quizCorrectCount} / ${total}`;

    const badge = document.getElementById('summaryGradeBadge');
    if (badge) {
      if (accuracy >= 90) badge.textContent = 'GRADE A+ · OUTSTANDING MASTERY 🌟';
      else if (accuracy >= 80) badge.textContent = 'GRADE A · EXCELLENT MASTERY ⭐';
      else if (accuracy >= 70) badge.textContent = 'GRADE B · SOLID PROFICIENCY 👍';
      else badge.textContent = 'GRADE C · ACTIVE RECALL RECOMMENDED 📚';
    }

    if (this.confetti) this.confetti.fire();
  }

  initGenerator() {
    const samples = {
      cs: `Operating Systems: Architecture and Memory Management\\nThe Kernel is the central core of an operating system responsible for resource management, device control, and process scheduling.\\nVirtual Memory refers to a memory management capability providing an idealized abstraction of storage resources.\\nPaging is a memory scheme that stores and retrieves data without contiguous allocation.\\nDeadlock represents a state where processes are blocked awaiting resources held by each other.`,
      bio: `Cellular Biology and Photosynthesis\\nPhotosynthesis is the biological process converting light into chemical energy stored in glucose.\\nChloroplast: Specialized double-membraned organelle in plant cells where reactions take place.\\nChlorophyll is a green pigment residing in the thylakoid membrane absorbing solar radiation.\\nCalvin Cycle refers to the light-independent reactions fixing carbon dioxide into sugars.`,
      physics: `Classical Mechanics and Optics\\nNewton's First Law is the principle of inertia stating an object remains at rest unless acted on by net force.\\nKinetic Energy refers to the energy possessed by an object due to its motion (1/2 mv^2).\\nRefraction is the change in direction and speed of a wave entering a different medium.`
    };

    const textInput = document.getElementById('lessonTextInput');
    const textCounter = document.getElementById('textCountDisplay');

    document.querySelectorAll('.chip-sample').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = samples[btn.dataset.sample];
        if (s && textInput) {
          textInput.value = s;
          if (textCounter) textCounter.textContent = `${s.split(/\\s+/).length} words · ${s.length} chars`;
          textInput.focus();
        }
      });
    });

    if (textInput && textCounter) {
      textInput.addEventListener('input', () => {
        const t = textInput.value.trim();
        textCounter.textContent = `${t ? t.split(/\\s+/).length : 0} words · ${t.length} chars`;
      });
    }

    const dropzone = document.getElementById('lessonDropzone');
    const fileInput = document.getElementById('lessonFileInput');
    let chosenFile = null;

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', (e) => {
        if (!e.target.closest('#removeFileBtn')) fileInput.click();
      });
      dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
      ['dragleave', 'dragend'].forEach(evt => dropzone.addEventListener(evt, () => dropzone.classList.remove('dragover')));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      });
      fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) handleFile(fileInput.files[0]);
      });
    }

    const handleFile = (f) => {
      chosenFile = f;
      document.getElementById('selectedFileName').textContent = f.name;
      document.getElementById('selectedFileSize').textContent = `${(f.size / 1024).toFixed(1)} KB`;
      document.getElementById('dropzoneDefaultContent').style.display = 'none';
      document.getElementById('selectedFileChip').style.display = 'flex';

      if (f.name.match(/\\.(txt|md|json|csv|py|js|html)$/i)) {
        const r = new FileReader();
        r.onload = (e) => {
          if (textInput && textInput.value.length < 50) {
            textInput.value = e.target.result;
            if (textCounter) textCounter.textContent = `${textInput.value.split(/\\s+/).length} words · ${textInput.value.length} chars`;
          }
        };
        r.readAsText(f);
      }
    };

    document.getElementById('removeFileBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      chosenFile = null;
      if (fileInput) fileInput.value = '';
      document.getElementById('dropzoneDefaultContent').style.display = 'block';
      document.getElementById('selectedFileChip').style.display = 'none';
    });

    const triggerBtn = document.getElementById('triggerGenerateBtn');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', async () => {
        const txt = textInput ? textInput.value.trim() : '';
        if (!chosenFile && txt.length < 15) {
          alert('Please upload a lesson document or paste course text to generate your active recall set.');
          return;
        }

        const loader = document.getElementById('genLoadingState');
        const success = document.getElementById('genSuccessBanner');
        if (loader) loader.style.display = 'block';
        if (success) success.style.display = 'none';
        triggerBtn.disabled = true;

        await new Promise(r => setTimeout(r, 1400));

        // Client synthesis
        const lines = txt.split('\\n').map(l => l.trim()).filter(Boolean);
        const title = lines[0] && lines[0].length < 60 ? lines[0].replace(/^[#\\*\\-\\s]+/, '') : 'Lesson Study Set';
        const concepts = [];

        lines.forEach(l => {
          const m = l.match(/^([A-Z0-9][A-Za-z0-9\\s\\-_/]{2,40})[:\\-—]\\s+(.+)$/);
          if (m && m[2].length > 10) concepts.push([m[1].trim(), m[2].trim()]);
        });
        txt.split(/(?<=[.!?])\\s+/).forEach(s => {
          const m = s.match(/\\b([A-Z][a-zA-Z0-9\\s]{2,35})\\s+(?:is defined as|refers to|is a|is an)\\s+(.+)/);
          if (m && !concepts.some(c => c[0].toLowerCase() === m[1].toLowerCase())) {
            concepts.push([m[1].trim(), s.trim()]);
          }
        });
        if (concepts.length < 3) {
          txt.split(/(?<=[.!?])\\s+/).forEach(s => {
            const w = s.split(/\\s+/);
            if (w.length >= 5) concepts.push([w.slice(0, 3).join(' '), s]);
          });
        }

        const cards = concepts.slice(0, 8).map((c, i) => ({
          id: i + 1,
          front: `What is ${c[0]}?`,
          tag: title,
          highlight: c[0],
          back: c[1]
        }));

        const quiz = concepts.slice(0, 5).map((c, i) => {
          const correct = c[1].length < 130 ? c[1] : c[1].slice(0, 125) + '...';
          const opts = concepts.filter(other => other[1] !== c[1]).map(o => o[1].slice(0, 120)).slice(0, 3);
          while (opts.length < 3) opts.push(`Alternative parameter ${opts.length + 1} with variable execution latency`);
          opts.splice(i % 4, 0, correct);
          return {
            id: i + 1,
            question: `According to the study material, which of the following best defines or describes '${c[0]}'?",
            options: opts,
            correct_answer: correct,
            explanation: `Directly established in the provided lesson: ${c[0]} is described as ${c[1].slice(0, 100)}.`
          };
        });

        this.activeDeck = { deck_title: title, type: 'AI Generated Deck', flashcards: cards, quiz };
        localStorage.setItem('lumina_active_study_set_v2', JSON.stringify(this.activeDeck));

        if (loader) loader.style.display = 'none';
        triggerBtn.disabled = false;

        if (success) {
          document.getElementById('generatedDeckTitle').textContent = title;
          document.getElementById('genCardCountMetric').textContent = `🎴 ${cards.length} Flashcards`;
          document.getElementById('genQuizCountMetric').textContent = `🧠 ${quiz.length} Quiz Questions`;
          document.getElementById('genMaxPtsMetric').textContent = `🏆 ${quiz.length * 100} Max Points`;
          success.style.display = 'block';
        }

        this.updateDeckRibbon();
        if (this.confetti) this.confetti.fire();
      });
    }

    document.getElementById('startGeneratedQuizBtn')?.addEventListener('click', () => {
      document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
      document.getElementById('quizModeBtn')?.classList.add('active');
      document.getElementById('quizGeneratorView').style.display = 'none';
      document.getElementById('quizContainerView').style.display = 'block';
      this.resetQuiz();
    });

    document.getElementById('openGeneratedCardsBtn')?.addEventListener('click', () => {
      document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
      document.getElementById('flashcardModeBtn')?.classList.add('active');
      document.getElementById('quizGeneratorView').style.display = 'none';
      document.getElementById('flashcardContainerView').style.display = 'block';
      this.currentCardsList = [...this.activeDeck.flashcards];
      this.renderFlashcard(0);
    });
  }
'''

updated_code = code[:start_idx] + new_quiz_logic + code[end_idx:]

with open(app_path, "w", encoding="utf-8") as f:
    f.write(updated_code)

print("Updated root app.js successfully! Length:", len(updated_code))
