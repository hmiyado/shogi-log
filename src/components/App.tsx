import { Router, Route } from 'preact-iso';
import { Home } from '../pages/Home';
import { KifuViewer } from '../pages/KifuViewer';
import { StatisticsPage } from '../pages/StatisticsPage';

export function App() {
    return (
        <div id="app">
            <header>
                <h1>将棋棋譜ログ</h1>
                <nav>
                    <a href="/" class="nav-link">
                        棋譜一覧
                    </a>
                    <a href="/statistics" class="nav-link">
                        対戦成績
                    </a>
                </nav>
            </header>
            <main id="main-content">
                <Router>
                    <Route path="/" component={Home} />
                    <Route path="/statistics" component={StatisticsPage} />
                    <Route
                        path="/kifu/:id/:date"
                        component={({ params }: any) => (
                            <KifuViewer id={params.id} date={params.date} />
                        )}
                    />
                    <Route default component={() => <div class="card text-center"><p>ページが見つかりません。</p></div>} />
                </Router>
            </main>
        </div>
    );
}
