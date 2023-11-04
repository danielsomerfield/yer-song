export const Logout = () => {
  const removeUserFromBrowser = () => {
    localStorage.removeItem("token");
  };

  return (
    <div>
      <div
        style={{
          fontSize: "2vh",
          maxWidth: "50vh",
          textAlign: "center",
          width: "50%",
        }}
      >
        This is a (currently) secret page for "logging out". This is for people
        who have been testing so far so they can clear their name.
      </div>
      <button onClick={removeUserFromBrowser}>Log me out</button>
    </div>
  );
};
