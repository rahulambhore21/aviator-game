# 📖 Aviator Crash Game - Glossary

## Key Terms & Definitions

| Term | Definition |
|------|------------|
| **Aviator** | The main game interface where players watch an airplane take off with a growing multiplier |
| **Betting Phase** | The 7-second period before each round when players can place bets |
| **Cash Out** | The action of securing winnings by clicking the cash-out button before the crash |
| **Crash Point** | The multiplier value at which the round ends (airplane crashes) |
| **Multiplier** | The growing value that starts at 1.00x and increases during the round |
| **Payout** | The amount a player wins (bet amount × cash-out multiplier) |
| **Round** | A complete game cycle: betting phase → multiplier growth → crash |
| **House Edge** | The mathematical advantage built into the game (~3% in crash point generation) |
| **Auto Cash-Out** | Feature allowing players to automatically cash out at a predetermined multiplier |
| **Next Round Bet** | Ability to place a bet for the upcoming round while current round is active |
| **Balance** | Virtual coins in a user's wallet (starts with 10,000 for new users) |
| **Deposit** | Adding virtual coins to user balance (requires admin approval) |
| **Withdrawal** | Removing virtual coins from user balance (requires admin approval) |
| **Transaction** | Any deposit or withdrawal request with status (pending/completed/rejected) |
| **Admin Panel** | Management interface for approving/rejecting financial transactions |
| **JWT (JSON Web Token)** | Secure authentication token used for user sessions |
| **WebSocket** | Real-time communication protocol for live game updates |
| **Socket.IO** | JavaScript library implementing WebSocket communication |
| **Zustand** | Lightweight state management library used in the frontend |
| **Mongoose** | MongoDB object modeling library for Node.js |
| **Haptic Feedback** | Mobile device vibration for user interaction feedback |
| **Route Protection** | Security mechanism preventing unauthorized access to pages |
| **Real-time Sync** | Live updates across all connected players during gameplay |
| **Provably Fair** | Cryptographic method ensuring game outcomes are genuinely random |
| **Rate Limiting** | Security feature preventing excessive API requests |
| **CORS (Cross-Origin Resource Sharing)** | Security policy for web browser API requests |
| **Production Environment** | Live deployment infrastructure (Vercel, Railway, MongoDB Atlas) |

## Game-Specific Terms

| Term | Definition |
|------|------------|
| **Flight Path** | Visual representation of the multiplier growth as airplane movement |
| **Crash Animation** | Visual effect when the round ends (airplane flies away) |
| **Recent Crashes** | Historical display of last 20 crash points |
| **Quick Bet Amounts** | Preset betting values (100, 200, 500, 1000 coins) |
| **Betting Panel** | UI component for placing bets and managing auto-settings |
| **Game Chart** | Main visualization showing multiplier growth and airplane |
| **Countdown Timer** | Visual countdown during betting phase |
| **Sound Effects** | Audio feedback for game actions (bet, cash-out, crash) |
| **Mobile Optimization** | Touch-friendly design with responsive layouts |
| **Wallet Modal** | Interface for deposit/withdrawal requests and transaction history |

## Technical Abbreviations

| Term | Definition |
|------|------------|
| **API** | Application Programming Interface |
| **UI/UX** | User Interface / User Experience |
| **SSR** | Server-Side Rendering |
| **CSR** | Client-Side Rendering |
| **SPA** | Single Page Application |
| **PWA** | Progressive Web Application |
| **CDN** | Content Delivery Network |
| **SSL/TLS** | Secure Sockets Layer / Transport Layer Security |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **REST** | Representational State Transfer |
| **JSON** | JavaScript Object Notation |
| **HTTPS** | HyperText Transfer Protocol Secure |
| **DNS** | Domain Name System |

## Status Values

| Term | Definition |
|------|------------|
| **Active** | Bet is currently placed and round is ongoing |
| **Cashed Out** | Player successfully withdrew before crash |
| **Lost** | Player didn't cash out before crash (bet lost) |
| **Pending** | Transaction awaiting admin approval |
| **Completed** | Transaction approved and processed |
| **Rejected** | Transaction denied by admin |
| **Connected** | User successfully connected to game server |
| **Disconnected** | User lost connection to game server |
| **Authenticated** | User successfully logged in with valid credentials |
| **Unauthorized** | User lacks permission for requested action |

---

*This glossary covers all essential terms used throughout the Aviator Crash Game project documentation and codebase.*
