# Agora

Agora is a simple, real-time application designed to easily share questions, collect feedback, or manage registration lists (such as class attendance). Users can create a session, share an invite link, and see participants join in real-time.

### 🚀 Features

- **Quick Session Creation**: Start an "Agora" session with just a title.
- **Easy Sharing**: Generate unique invite links for participants to join.
- **Real-time Updates**: See participants appear instantly as they join, thanks to real-time broadcasting.
- **Simple Participant Management**: Collect names or presence easily.

### 🛠 Tech Stack

- **Framework**: [AdonisJS v6](https://adonisjs.com/)
- **Frontend**: [Inertia.js](https://inertiajs.com/) with [React](https://react.dev/)
- **Database**: SQLite (via Lucid ORM)
- **Real-time**: [AdonisJS Transmit](https://github.com/adonisjs/transmit) for SSE-based broadcasting
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (standard for modern Adonis/Inertia setups)

### 🏁 Getting Started

#### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher)
- npm or pnpm

#### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd agora
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Note: Ensure `HOST` and `PORT` are correctly set in your `.env` for invite links to work)*

4. Run database migrations:
   ```bash
   node ace migration:run
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3333`.

### 📖 How it Works

1. **Create**: On the home page, enter a title for your session (e.g., "Math Class - Oct 24").
2. **Invite**: Copy the generated invite link and share it with your audience.
3. **Join**: Participants enter their names via the invite link.
4. **Monitor**: The session creator sees the list of participants update in real-time as they join.

### 📜 License

This project is unlicensed (private).
