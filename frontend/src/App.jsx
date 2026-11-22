import React, { useEffect } from 'react';
import agencyCleanScript from './agencyCleanRaw.js?raw';

export default function App() {
  useEffect(() => {
    document.title = 'ORVIA';
    const existing = document.getElementById('orvia-agency-script');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = 'orvia-agency-script';
    script.textContent = `(() => {\n${agencyCleanScript}\nObject.assign(window, { S, D, OB, PLANS, TASKS, TK, T, TX, CATS, OBS, ROLES, ME, MEN, N, NAV, PAGES, CLIENT_BRAND, EMP, BR, PR, ST, TS, TS2, DONE4, STR, go, setRole, logout, view, render, act, E_del, gen, chg, togPw, doLogin, doForgot, doReset, closeM, ask, askOk, arch, delB, upS, dlS, sgo, newPlan, newCamp, newItem, setIt, setTS, newTask, saveTask, roleCh, save, obSubmit, obFinish, tset, tdet, teamView, teamNew, teamSave, teamEdit, teamUpd, teamDel, teamRm, nview, goTo, openD, itType, itSave, editItem, delItem, delPlan, newPlanP });\n})();`;
    document.body.appendChild(script);
  }, []);

  return <div id="app" />;
}
