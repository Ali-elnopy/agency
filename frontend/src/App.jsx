import React, { useEffect } from 'react';
import agencyCleanScript from './agencyCleanRaw.js?raw';

export default function App() {
  useEffect(() => {
    document.title = 'ORVIA';
    const appRoot = document.getElementById('app');
    if (
      appRoot &&
      appRoot.childElementCount > 0 &&
      typeof window.__orviaBindListeners === 'function'
    ) {
      window.__orviaBindListeners();
      return () => {
        if (typeof window.__orviaCleanup === 'function') {
          window.__orviaCleanup();
        }
      };
    }

    if (typeof window.__orviaCleanup === 'function') {
      window.__orviaCleanup();
    }
    const existing = document.getElementById('orvia-agency-script');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = 'orvia-agency-script';
    script.textContent = `(() => {\n${agencyCleanScript}\nObject.assign(window, { S, D, OB, PLANS, TASKS, TK, T, TX, CATS, OBS, ROLES, ME, MEN, N, NAV, PAGES, CLIENT_BRAND, EMP, BR, PR, ST, TS, TS2, DONE4, STR, REQ, CHANGE_REQS, MR, WRK, STG, SP, LANDING_MSGS, AUTH_LOCKOUT, AUTH_AUDIT, esc, safeUrl, isAllowedPage, onSearch, clearSearch, pickSearchResult, openSearchDD, closeSearchDD, getApiToken, setApiTokens, clearApiTokens, toast, go, setRole, logout, view, render, act, E_del, gen, chg, editProfile, saveProfile, onProfilePhoto, removeProfilePhoto, togPw, openLanding, sendLandingContact, doLogin, doForgot, doVerifyOtp, doResendOtp, doResetPassword, updatePwMeter, syncOtpBoxes, onOtpBoxInput, onOtpBoxKey, onOtpBoxPaste, loadMailStatus, saveMailCfg, toggleTheme, closeM, ask, askOk, arch, delB, upS, pvS, dlS, sgo, newPlan, newCamp, editCamp, saveEditCamp, delCamp, doDelCamp, newItem, setIt, setTS, newTask, saveTask, editTask, saveEditTask, submitTaskModal, confirmSubmitTask, reviewChangesModal, attachTaskModal, confirmAttachTask, roleCh, save, obSelectCategory, obSubmit, obFinish, addActivityQGroup, ACTIVITY_QGROUPS, tset, tdet, teamView, teamNew, teamSave, teamEdit, teamUpd, teamDel, teamRm, teamEditAbout, teamSaveAbout, teamEditMem, teamSaveMem, teamEditBr, teamSaveBr, nview, markRead, markAllRead, refreshNotifications, startNotificationPolling, stopNotificationPolling, goTo, openD, itType, itSave, editItem, delItem, doDelItem, delPlan, doDelPlan, editPlan, saveEditPlan, setPlanStatus, newPlanP, assignItemTasks, saveItemTasks, mv, mvAsk, cmt, setLink, pubRec, confirmPubRec, loadItemRevisions, loadItemPublishing, viewRevisionSnapshot, resolveChangeReq, forwardChangeReq, confirmForwardChangeReq, cmv, loadCalendarMonth, reqNew, reqReview, reqOk, confirmReqOk, reqNo, reqTask, reqItem, repUp, repRev, repSave, repAi, repTxt, repOk, repSh, calcMemberPerf, memberPerfDet, startWork, wrkOpen, wrkNew, openSub, subBack, subLink, subFiles, subRm, subDone, wfGo, leaveDet, applyResetHash });\n})();`;
    document.body.appendChild(script);

    return () => {
      if (typeof window.__orviaCleanup === 'function') {
        window.__orviaCleanup();
      }
    };
  }, []);

  return <div id="app" />;
}
