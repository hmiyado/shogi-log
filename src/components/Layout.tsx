interface LayoutProps {
    children: any;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div id="app">
            <header>
                <h1>将棋棋譜ログ</h1>
                <nav>
                    <a href="/" class="nav-link">
                        棋譜一覧
                    </a>
                    <a href="/statistics.html" class="nav-link">
                        対戦成績
                    </a>
                </nav>
            </header>
            <main id="main-content">
                {children}
            </main>
        </div>
    );
}
