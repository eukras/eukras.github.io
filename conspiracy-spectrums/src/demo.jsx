

import { useAutoAnimate } from '@formkit/auto-animate/preact';
import { signal } from '@preact/signals';
import { render } from 'preact';

const icons = ["🎁", "📦", "🚚", "💪", "🐽", "🐸", "🐻", "🪱", "🪳"]
const items = signal(icons)

function App() {

    const [parent] = useAutoAnimate(/* optional config */)

    function cycle() {
        console.log('CYCLE');
        items.value = [...items.value.slice(1), items.value[0]];
    }

    return <>
        <ul ref={parent}>
            {items.value.map(
                item => <li key={item}>{item}</li>
            )}
        </ul>
        <button onClick={cycle}>Cycle Emoji</button>
        <pre>{JSON.stringify(items)}</pre>
    </>
}

render(<App />, document.getElementById('app'));
