export default function Tokenise({ userID }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-green-700">Tokenise Assets</h2>
      <p className="text-gray-600">
        UserID: {userID} — Here you can convert your carbon assets into tokens.
      </p>
      {/* Add tokenisation logic here */}
    </div>
  );
}
