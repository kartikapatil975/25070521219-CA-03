import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { ToastContainer } from '../components/ToastContainer';
import { CompassModal } from '../components/CompassModal';
import { BookModal } from '../components/BookModal';
import { SessionModal } from '../components/SessionModal';
import { GoalModal } from '../components/GoalModal';

export const AppLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [bookModalState, setBookModalState] = useState({ isOpen: false, book: null });
  const [sessionModalState, setSessionModalState] = useState({ isOpen: false, session: null, defaultBookId: null });
  const [goalModalState, setGoalModalState] = useState({ isOpen: false, goal: null });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerGlobalRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-parchment-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onOpenBookModal={() => setBookModalState({ isOpen: true, book: null })}
        onOpenSessionModal={() => setSessionModalState({ isOpen: true, session: null, defaultBookId: null })}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar
          setIsMobileOpen={setIsMobileOpen}
          onOpenBookModal={() => setBookModalState({ isOpen: true, book: null })}
          onOpenSessionModal={() => setSessionModalState({ isOpen: true, session: null, defaultBookId: null })}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet
            context={{
              refreshTrigger,
              triggerGlobalRefresh,
              openBookModal: (book = null) => setBookModalState({ isOpen: true, book }),
              openSessionModal: (session = null, defaultBookId = null) =>
                setSessionModalState({ isOpen: true, session, defaultBookId }),
              openGoalModal: (goal = null) => setGoalModalState({ isOpen: true, goal }),
            }}
          />
        </main>
      </div>

      {/* Shared Modals and Notifications */}
      <ToastContainer />
      <CompassModal />

      <BookModal
        isOpen={bookModalState.isOpen}
        bookToEdit={bookModalState.book}
        onClose={() => setBookModalState({ isOpen: false, book: null })}
        onSuccess={triggerGlobalRefresh}
      />

      <SessionModal
        isOpen={sessionModalState.isOpen}
        sessionToEdit={sessionModalState.session}
        defaultBookId={sessionModalState.defaultBookId}
        onClose={() => setSessionModalState({ isOpen: false, session: null, defaultBookId: null })}
        onSuccess={triggerGlobalRefresh}
      />

      <GoalModal
        isOpen={goalModalState.isOpen}
        goalToEdit={goalModalState.goal}
        onClose={() => setGoalModalState({ isOpen: false, goal: null })}
        onSuccess={triggerGlobalRefresh}
      />
    </div>
  );
};

