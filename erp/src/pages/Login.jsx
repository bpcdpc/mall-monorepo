export default function Login() {
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <form onSubmit={handleSubmit}>
      <div>Login</div>
      <div>
        <label>아이디</label>
        <input type="text" />
      </div>
      <div>
        <label>비밀번호</label>
        <input type="password" />
      </div>
      <div>
        <button type="submit"></button>
      </div>
    </form>
  );
}
