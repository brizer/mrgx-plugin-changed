const cp = require("child_process");
const { Config } = require("mrgx");
const { loading } = require("@tomato-node/ui");

const exec = async (program) => {
  const loader = loading("Analysis...\n").show();
  const configIns = new Config({program});
  const projectList = await configIns.getProjectList();
  const updatedList = [];
  projectList.map((project) => {
    const { path, alias } = project;
    const diff = cp.execSync("git diff HEAD", { cwd: path, encoding: "utf-8" });
    if (diff !== "") {
      updatedList.push(`${alias}: (${path})`);
    }
  });
  if (updatedList.length === 0) {
    loader.hide({ type: "succeed", text: "No changed projects found" });
    process.exit(0);
  }
  const printOut = updatedList.join("\n");
  console.log(`${printOut}\n`);
  loader.hide({ type: "succeed", text: "Analysis done!!" });
};

const diff = async (program) => {
  const loader = loading("Analysis...\n").show();
  const configIns = new Config({program});
  const projectList = await configIns.getProjectList();
  let diffInfo = "";
  projectList.map((project) => {
    const { path, alias } = project;

    const diff = cp.execSync("git diff --color", {
      cwd: path,
      encoding: "utf-8",
    });
    if (diff !== "") {
      diffInfo = diffInfo.concat(
        `\n>>>>>>>>>>>>>>>${alias}'s diff:>>>>>>>>>>>>>>>\n`,
        diff
      );
    }
  });
  if (diffInfo.length === 0) {
    loader.hide({ type: "succeed", text: "No diff found" });
    process.exit(0);
  }
  const printOut = diffInfo.concat("\n");
  console.log(`${printOut}\n`);
  loader.hide({ type: "succeed", text: "Analysis done!!" });
};

module.exports.register = async (program) => {
  program
    .command("changed")
    .description("show which project is not commit")
    .action(async () => {
      await exec(program);
    });
  program
    .command("diff")
    .description("show detail diff")
    .action(async () => {
      await diff(program);
    });
};
