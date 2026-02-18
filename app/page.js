'use client';

import { useEffect, useMemo, useState } from 'react';
import menu from '../data/menu-database.json';
import { generateRecipe, evaluatePairing, generateDisguisePlan } from '../lib/generator';
import pairingRules from '../data/pairing-rules.json';

const proteins = Object.entries(menu.proteins).flatMap(([category, items]) => items.map(i => ({ name: i, category })));
const sides = Object.entries(menu.sides).flatMap(([category, items]) => items.map(i => ({ name: i, category })));

export default function Home() {
  const [protein, setProtein] = useState('Salmon');
  const [selectedSides, setSelectedSides] = useState(['Garlic Asparagus']);
  const [servings, setServings] = useState(2);
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [method, setMethod] = useState('oven');
  const [timeLimitMin, setTimeLimitMin] = useState(35);
  const [flavorStyle, setFlavorStyle] = useState('healthy');
  const [mode, setMode] = useState('normal');
  const [theme, setTheme] = useState('dark');

  const [submittedRecipe, setSubmittedRecipe] = useState(null);
  const [submittedDisguisePlan, setSubmittedDisguisePlan] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const suggestedSides = useMemo(() => {
    const p = proteins.find(x => x.name === protein);
    if (!p) return [];
    const prefTags = pairingRules.protein_category_preferences[p.category]?.prefer_tags || [];
    return sides
      .map(s => ({
        side: s.name,
        score: prefTags.some(t => s.name.toLowerCase().includes(t.split('_')[0])) ? 2 : 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(x => x.side);
  }, [protein]);

  function toggleSide(sideName) {
    setSelectedSides(prev => {
      if (prev.includes(sideName)) return prev.filter(x => x !== sideName);
      if (prev.length >= 3) return prev;
      return [...prev, sideName];
    });
  }

  function submitFor(currentProtein, currentSides) {
    if (currentSides.length < 1) {
      alert('Pick at least 1 side.');
      return;
    }

    const pairing = evaluatePairing({ protein: currentProtein, selectedSides: currentSides, flavorStyle, pairingRules });
    const recipe = generateRecipe({
      protein: currentProtein,
      selectedSides: currentSides,
      servings,
      skillLevel,
      method,
      timeLimitMin,
      flavorStyle,
      pairing
    });

    if (mode === 'disguise') {
      const plan = generateDisguisePlan({ selectedSides: currentSides, servings, skillLevel });
      setSubmittedDisguisePlan(plan);
      setSubmittedRecipe(recipe);
    } else {
      setSubmittedRecipe(recipe);
      setSubmittedDisguisePlan(null);
    }
  }

  function handleSubmit() {
    submitFor(protein, selectedSides);
  }

  function handleRandomMeal() {
    const randomProtein = proteins[Math.floor(Math.random() * proteins.length)]?.name || 'Salmon';
    const sideCount = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...sides].sort(() => Math.random() - 0.5);
    const randomSides = shuffled.slice(0, sideCount).map(s => s.name);

    setProtein(randomProtein);
    setSelectedSides(randomSides);
    submitFor(randomProtein, randomSides);
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <h1>Kiara Easy Foods ✨</h1>
          <p>Select your meal, hit submit, then get step-by-step cooking instructions.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="theme-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
          </button>
          <div className="badge">No ingredient typing</div>
        </div>
      </section>

      <section className="card" style={{ marginBottom: 12 }}>
        <h2>Mode</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className={`mode-btn ${mode === 'normal' ? 'on' : ''}`} onClick={() => setMode('normal')}>Normal Mode</button>
          <button className={`mode-btn ${mode === 'disguise' ? 'on' : ''}`} onClick={() => setMode('disguise')}>Disguise Mode 🥸</button>
          <button className={`mode-btn ${mode === 'auto' ? 'on' : ''}`} onClick={() => setMode('auto')}>Auto Pick 🎲</button>
        </div>
      </section>

      <section className="kpis">
        <div className="kpi"><div className="label">Protein DB</div><div className="value">{menu.counts.proteins_total}</div></div>
        <div className="kpi"><div className="label">Sides DB</div><div className="value">{menu.counts.sides_total}</div></div>
        <div className="kpi"><div className="label">Sides Selected</div><div className="value">{selectedSides.length}/3</div></div>
      </section>

      <div className="layout-grid">
        <section className="stack">
          <article className="card">
            <h2>1) Protein</h2>
            <div className="field">
              <span>Choose one protein</span>
              <select className="select" value={protein} onChange={e => setProtein(e.target.value)}>
                {proteins.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            </div>
          </article>

          <article className="card">
            <h2>2) Sides (pick 1–3)</h2>
            <p className="muted" style={{ marginTop: 0 }}>Suggested: {suggestedSides.join(', ') || '—'}</p>
            <div className="side-grid">
              {sides.map(s => (
                <button key={s.name} onClick={() => toggleSide(s.name)} className={`side-btn ${selectedSides.includes(s.name) ? 'on' : ''}`}>
                  {s.name}
                </button>
              ))}
            </div>
          </article>

          <article className="card">
            <h2>3) Optional preferences</h2>
            <div className="pref-grid">
              <label className="field">Servings<input className="input" type="number" min="1" max="12" value={servings} onChange={e => setServings(Number(e.target.value))} /></label>
              <label className="field">Skill<select className="select" value={skillLevel} onChange={e => setSkillLevel(e.target.value)}><option>beginner</option><option>intermediate</option></select></label>
              <label className="field">Method<select className="select" value={method} onChange={e => setMethod(e.target.value)}><option>stovetop</option><option>oven</option><option>air_fryer</option><option>grill</option></select></label>
              <label className="field">Time limit (min)<input className="input" type="number" min="10" max="180" value={timeLimitMin} onChange={e => setTimeLimitMin(Number(e.target.value))} /></label>
              <label className="field">Flavor style<select className="select" value={flavorStyle} onChange={e => setFlavorStyle(e.target.value)}><option>quick</option><option>healthy</option><option>comfort</option><option>spicy</option></select></label>
            </div>
          </article>

          <article className="card">
            {mode === 'auto' ? (
              <>
                <p className="muted" style={{ marginTop: 0 }}>Don’t want to choose? Tap once and I’ll pick a random protein + 1–3 sides.</p>
                <button onClick={handleRandomMeal} className="submit-btn">Generate Random Meal 🎲</button>
                <div className="random-row-wrap">
                  <div className="random-row-label">Current random set</div>
                  <div className="random-row">
                    <span className="random-pill protein">Protein: {protein}</span>
                    {selectedSides.map((side, idx) => (
                      <span key={`${side}-${idx}`} className="random-pill">Side: {side}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <button onClick={handleSubmit} className="submit-btn">{mode === 'disguise' ? 'Submit + Build Disguise Plan ✅' : 'Submit Meal ✅'}</button>
            )}
          </article>
        </section>

        <section className="stack">
          <article className="card">
            <h2>Cooking Instructions</h2>
            {!submittedRecipe ? (
              <p className="muted">Pick your foods and click <strong>{mode === 'auto' ? 'Generate Random Meal' : 'Submit Meal'}</strong> to generate cooking instructions.</p>
            ) : (
              <>
                <h3 style={{ marginTop: 2 }}>{submittedRecipe.recipe.title}</h3>
                <p className="muted" style={{ marginTop: 0 }}>{submittedRecipe.recipe.summary}</p>
                <p><strong>Total Time:</strong> {submittedRecipe.recipe.totalCookTimeMin} min</p>

                <h3>Ingredients</h3>
                <ul>
                  {submittedRecipe.recipe.ingredients.map((ing, idx) => (
                    <li key={idx}><strong>{ing.item}</strong> — {ing.amount}</li>
                  ))}
                </ul>

                <h3>Step-by-step</h3>
                <ol>
                  {submittedRecipe.recipe.steps.map(step => (
                    <li key={step.stepNumber} style={{ marginBottom: 10 }}>
                      <div>{step.instruction}</div>
                      <small className="muted">~{step.timeMin} min{step.techniqueTip ? ` • Tip: ${step.techniqueTip}` : ''}</small>
                    </li>
                  ))}
                </ol>

                <h3>Substitutions</h3>
                <ul>
                  {submittedRecipe.recipe.substitutions.map((s, idx) => (
                    <li key={idx}><strong>{s.original}</strong> → {s.swap} <span className="muted">({s.impact})</span></li>
                  ))}
                </ul>

                <h3>Common mistakes</h3>
                <ul>
                  {submittedRecipe.recipe.commonMistakes.map((m, idx) => (
                    <li key={idx}><strong>{m.mistake}:</strong> {m.fix}</li>
                  ))}
                </ul>

                {submittedDisguisePlan && (
                  <>
                    <h3>Disguise Mode Plan 🥸</h3>
                    <p className="muted" style={{ marginTop: 0 }}>{submittedDisguisePlan.summary}</p>
                    {submittedDisguisePlan.plans.map((plan, idx) => (
                      <div key={idx} className="disguise-card">
                        <h4 style={{ margin: '2px 0 8px' }}>{plan.side}</h4>
                        <p style={{ margin: '4px 0' }}><strong>Method:</strong> {plan.disguiseMethod}</p>
                        <p style={{ margin: '4px 0' }}><strong>Hidden amount:</strong> {plan.hiddenAmountGuide}</p>
                        <p style={{ margin: '4px 0' }}><strong>Visibility:</strong> {plan.visibilityScore} • <strong>Taste impact:</strong> {plan.tasteImpact}</p>
                        <ol style={{ marginTop: 6 }}>
                          {plan.instructions.map((step, sIdx) => <li key={sIdx}>{step}</li>)}
                        </ol>
                        <p style={{ margin: '6px 0' }}><strong>If noticed:</strong> {plan.fallbackIfNoticed}</p>
                        <p className="muted" style={{ margin: 0 }}><strong>Skill note:</strong> {plan.skillNote}</p>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}
