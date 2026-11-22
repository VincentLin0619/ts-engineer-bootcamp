// Run from the project root (type the answers yourself, `quit` to stop):
//   bun run day-05-crud-in-memory/examples/04-prompt-commands.ts
//
// Or feed it the answers through a pipe, one answer per line:
//   printf '小明\nadd 買牛奶 和雞蛋\nlist\nquit\n' | bun run day-05-crud-in-memory/examples/04-prompt-commands.ts

// --- prompt() returns `string | null` ---------------------------------------

// prompt() shows the message, waits for one line of input and returns it.
// It returns null when there is nothing to read: the user pressed Enter
// without typing, or the piped input has ended.
const learnerName = prompt("你叫什麼名字？");

if (learnerName === null) {
  console.log("沒有輸入名字");
} else {
  console.log(`你好，${learnerName}！`);
}

// --- Splitting one line into a command name and an argument ------------------

type Command = { name: string; argument: string };

function parseCommand(line: string): Command {
  // trim() removes the spaces at both ends: "  list  " -> "list"
  const trimmed = line.trim();

  // indexOf(" ") is the position of the first space, or -1 when there is none.
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) {
    return { name: trimmed, argument: "" };
  }

  // slice(start, end) copies part of a string. Positions start at 0.
  return {
    name: trimmed.slice(0, spaceIndex),
    argument: trimmed.slice(spaceIndex + 1).trim(),
  };
}

console.log(parseCommand("add 買牛奶"));
console.log(parseCommand("  list  "));

// --- The command loop -------------------------------------------------------

// Keep asking until the command is `quit`, or there is nothing left to read.
let running = true;

while (running) {
  const line = prompt("指令>");

  if (line === null) {
    running = false;
  } else {
    const command = parseCommand(line);
    console.log(`名稱：「${command.name}」，參數：「${command.argument}」`);

    if (command.name === "quit") {
      running = false;
    }
  }
}

console.log("結束");
