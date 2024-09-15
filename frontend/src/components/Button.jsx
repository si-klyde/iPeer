const Button = ({ className, href, onClick, children, px, white }) => {
  // Set the base class names for the button, including padding and text color
  const classes = `button relative inline-flex items-center justify-center h-11 transition-colors hover:bg-green-600 ${
    px || "px-7"
  } ${white ? "bg-white text-green-700" : "bg-green-500 text-white"} ${
    className || ""
  } rounded-full`;

  const spanClasses = "relative z-10";

  // Function to render a button element
  const renderButton = () => (
    <button className={classes} onClick={onClick}>
      <span className={spanClasses}>{children}</span>
    </button>
  );

  // Function to render an anchor (link) element
  const renderLink = () => (
    <a href={href} className={classes}>
      <span className={spanClasses}>{children}</span>
    </a>
  );

  // Conditionally render either a button or a link, based on the presence of href
  return href ? renderLink() : renderButton();
};

export default Button;
