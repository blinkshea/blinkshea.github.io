(async function mountHostedApp() {
  const partCount = 4;
  const partPaths = Array.from({ length: partCount }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return `./data/app-part-${number}.txt`;
  });

  try {
    const responses = await Promise.all(partPaths.map((path) => fetch(path, { cache: "no-store" })));
    const texts = await Promise.all(
      responses.map(async (response, index) => {
        if (!response.ok) {
          throw new Error(`App part ${index + 1} failed with ${response.status}`);
        }
        return response.text();
      })
    );

    new Function(texts.join(""))();
  } catch (error) {
    console.error("Unable to load hosted app", error);
  }
})();
