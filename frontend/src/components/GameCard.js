import Image from "next/image";

const GameCard = ({ title, imageSrc, description, downloadIcon, downloadLink }) => {
  return (
    <div className="col-md-4 mb-4">
      <div className="card text-center shadow-sm game-card hover-scale">
        <Image
          src={imageSrc}
          alt={title}
          width={400}
          height={250}
          className="card-img-top rounded-top"
          style={{ objectFit: "cover" }}
        />
        <div className="card-body">
          <h5 className="card-title fw-bold">{title}</h5>
          <p className="card-text text-muted">{description}</p>
          <div className="mt-2">
            {downloadLink ? (
              <a href={downloadLink} download>
                <Image 
                  src={downloadIcon}
                  alt="Download Icon"
                  width={180}
                  height={60}
                  className="img-fluid"
                />
              </a>
            ) : (
              <Image 
                src={downloadIcon}
                alt="Download Icon (Disabled)"
                width={180}
                height={60}
                className="img-fluid opacity-50"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
