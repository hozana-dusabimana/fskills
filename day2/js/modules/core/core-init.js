// Initializes core game settings and environment
onerror = (event, source, lineno, colno, error) => {
                document.body.style.backgroundColor = '#222';
                document.body.innerHTML = `<pre style="color:red;font-size:50px;">Some thing went wrong in starting the game` +
                    `${event}\n${source}\nLn ${lineno}, Col ${colno}`;
            }