import React, { useEffect } from 'react';
import agencyCleanScript from './agencyCleanRaw.js?raw';

export default function App() {
  useEffect(() => {
    document.title = 'ORVIA';
    const existing = document.getElementById('orvia-agency-script');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = 'orvia-agency-script';
    script.textContent = `(() => {\n${agencyCleanScript}\nObject.assign(window, { S, D, OB, PLANS, TASKS, TK, T, TX, CATS, OBS, ROLES, ME, MEN, N, NAV, PAGES, CLIENT_BRAND, EMP, BR, PR, ST, TS, TS2, DONE4, STR, REQ, MR, WRK, STG, SP, esc, toast, go, setRole, logout, view, render, act, E_del, gen, chg, togPw, doLogin, doForgot, doVerifyOtp, doResendOtp, doResetPassword, updatePwMeter, syncOtpBoxes, onOtpBoxInput, onOtpBoxKey, onOtpBoxPaste, loadMailStatus, saveMailCfg, toggleTheme, closeM, ask, askOk, arch, delB, upS, dlS, sgo, newPlan, newCamp, newItem, setIt, setTS, newTask, saveTask, roleCh, save, obSubmit, obFinish, tset, tdet, teamView, teamNew, teamSave, teamEdit, teamUpd, teamDel, teamRm, teamEditAbout, teamSaveAbout, teamEditMem, teamSaveMem, teamEditBr, teamSaveBr, nview, goTo, openD, itType, itSave, editItem, delItem, delPlan, newPlanP, mv, mvAsk, cmt, setLink, pubRec, cmv, reqNew, reqOk, reqNo, reqTask, reqItem, repUp, repRev, repSave, repAi, repTxt, repOk, repSh, startWork, wrkOpen, wrkNew, openSub, subBack, subLink, subFiles, subRm, subDone, wfGo, leaveDet });\n})();`;
    document.body.appendChild(script);
  }, []);

  return <div id="app" />;
}
