import React from 'react';
import { Logo } from './Logo';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('SiraMix interface error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const isArabic = document.documentElement.dir === 'rtl';
    return (
      <main className="workspace-shell grid min-h-screen place-items-center px-4">
        <section className="brand-surface max-w-lg rounded-[1.75rem] p-8 text-center">
          <Logo size="lg" className="mb-6 justify-center" />
          <h1 className="text-2xl font-black text-foreground">
            {isArabic ? 'صار خطأ غير متوقع في الواجهة' : 'Something unexpected happened'}
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {isArabic
              ? 'بياناتك المحفوظة ما تأثرت. أعد تحميل الصفحة، وإذا تكرر الخطأ جرّب مرة ثانية بعد لحظات.'
              : 'Your saved data is safe. Reload the page, and try again in a moment if the issue repeats.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="brand-action mt-6 rounded-xl px-5 py-3 text-sm font-black"
          >
            {isArabic ? 'إعادة تحميل الصفحة' : 'Reload page'}
          </button>
        </section>
      </main>
    );
  }
}
