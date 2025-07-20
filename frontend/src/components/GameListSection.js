import GameCard from "./GameCard";

const GameListSection = () => {
  return (
    <section className="container my-5 position-relative content">
      <div className="row g-4">
        <GameCard
          title="TBP RACE GAME"
          imageSrc="/images/race-game.png"
          description="Multiplayer Racing Game"
          downloadIcon="/images/download-enable.png"
          downloadLink="/apk/tbprace.apk"
        />
        <GameCard
          title="SUBMARINE ADVENTURE"
          imageSrc="/images/submarine-game.png"
          description="Submarine exploration game."
          downloadIcon="/images/download-disable.png"
        />
        <GameCard
          title="COMBAT FORCE"
          imageSrc="/images/combat-game.png"
          description="Challenging & intense shooter game."
          downloadIcon="/images/download-disable.png"
        />
      </div>
    </section>
  );
};

export default GameListSection;
