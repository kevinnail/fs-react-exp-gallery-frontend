# CSS class name cleanup

Every class, keyframe and custom property that starts with `slg-` loses the prefix and gets a name that says what the element is and where it lives. Misleading names (`slg-item-footer` on something that is not a footer, `-head`, `-meta`, `-inner`, `-stage`, `-hit`) are renamed in the same pass.

Starting point: 528 unique `slg-` classes across 62 files, plus 20 `--slg-*` design tokens in `tokens.css`.

## Naming rules

1. No project prefix.
2. The name says what the element is. A `footer` class is a footer. Filler words (`head`, `meta`, `inner`, `stage`, `hit`, `copy`) become the thing the element holds.
3. CSS is global (Create React App, no CSS modules), so every class is app-wide. When a plain name would collide or be ambiguous, prefix it with the component or page section it belongs to (`not-found-title`, `search-result`), never the project.
4. Modifiers keep the `block--modifier` form. The modifier word names the state (`--selected`, not `--on`).
5. Keyframes and component-local custom properties follow the same rules.

## What each slice does

- Renames CSS selectors, keyframes, component-local custom properties, JSX `className` strings (including template-built modifiers like `` `share-button--${variant}` ``), ids and aria ids built from the old names, and test selectors, all together.
- Changes no styling, except where slice 9 separates a name that several stylesheets define (see slice 9). Deletes nothing.
- Verified by: `grep -rn "slg-"` over the slice's files returns only design-token uses (until slice 8), `npm run lint`, `npm run format:check` and `npm run build` pass, Kevin runs the tests and looks at the touched pages.

## Slices

1. **Standalone components.** Loading, NotFound, Sheet, ShareButton, SearchBar. No other file references their classes. NotFound's `slg-button` classes are defined in `NewestPieceHero.css` and move in slice 3.
2. **Shared styles.** `src/styles/forms.css`, `item-cards.css`, `status-chips.css` and every file using them: PostForm, AuctionForm (JS and CSS), GallerySalesPanel, AuctionResultsPanel, the selectors in AdminSales.css that target form fields, UserAuctions, UserSales and `UserSales.test.js`. The bare `placeholder` class on account thumbnails becomes a modifier, so Auth.css's global `.placeholder` rule stops reaching it.
3. **Home gallery.** MainGallery, LiveAuctions, NewestPieceHero, MainGalleryPostCard. `.slg-section-head` is defined in both MainGallery.css and LiveAuctions.css. `slg-button` (NewestPieceHero.css, also used by NotFound) and `slg-eyebrow` (MainGallery.css, also used by PostForm, AuctionForm and AdminSales) move here along with every file using them.
4. **Piece detail and requests.** MainPostDetail, RequestButton, RequestTray, RequestPage (and `RequestPage.test.js`), PieceAttachment.
5. **About page.** AboutMe.
6. **Admin dashboard.** Admin, PostCard, PostForm, AuctionForm, Inventory, AuctionResultsPanelSimple.
7. **Admin sales.** AdminSales.css (106 classes), GallerySalesPanel, AuctionResultsPanel, SaleStages. Built in two parts:
   - 7a: the vocabulary both tabs share (page shell, stats, list, detail panel, tracking, SaleStages) and AuctionResultsPanel.
   - 7b: the gallery create-sale flow (modal, customer search, piece finder, order items, order totals) and `GallerySalesPanel.test.js`.
8. **Design tokens.** The 20 `--slg-*` properties in `tokens.css` and their uses across the app, renamed to what they hold (`--slg-ink` is the text color, `--slg-void` the page background, and so on).
9. **Unprefixed classes.** Stylesheets no earlier slice touched, audited for misleading and generic names. Many plain names (`.active`, `.user-email`, `.unread-badge`, `.submit-btn`, `.message-input` and others) are defined in more than one stylesheet, so a component using one currently picks up every stylesheet's rules for it. Decision: each component gets its own name and keeps only the rules its own stylesheet sets. That is a deliberate styling change, so each part lists the pages where an inherited rule goes away. Built in parts by page area:
   - 9a: Auth pages. Auth, AgreementModal, ForgotPassword, ResetPassword. Auth.css's global `.active` currently styles every `active` class in the app, including Menu's current `NavLink` and AuctionCard's selected thumbnail. Auth's two `NavLink`s move to a `className` function so the sign-in and sign-up links keep their highlight.
   - 9b: Header and Menu.
   - 9c: Messages and AdminInbox, the `piece-metadata-highlight` card PieceAttachment renders, and the `messages-container`, `messages-content` and `messages-header` layout classes that AuctionList, AuctionDetail and AuctionArchive borrow from Messages.css. Both stylesheets also define `@keyframes pulse`.
   - 9d: Account. Account, AccountForm, PaymentDueSummary, UserAuctions.css, UserSales.css.
   - 9e: Auctions. AuctionList, AuctionCard, AuctionRulesModal, AuctionArchive, AuctionDetail.
   - 9f: Admin tools and app shell. UsersDashboard, DiscountForm, MassEmailForm, App.css. DiscountForm's section uses Auth.css's `.form-section`, which Auth itself never uses.

## Out of scope

- `slg-request-items` in `src/stores/cartStore.js` is a localStorage key, not a class. Renaming it empties every visitor's saved request cart.

## Found along the way

- `.admin-sales-modal-actions` and `.admin-sales-visually-hidden` (formerly `.slg-modal-actions` and `.slg-sales-hidden`) in AdminSales.css are not used by any component.
- AdminSales.css redefines the money input wrapper (now `.form-money-input-wrapper`) as `display: block`. It loads after `forms.css`, so that override also reaches the PostForm and AuctionForm money fields, not just the sales create form it was written for. The rename keeps this behavior as is.
- `.pagination-button.active` in UsersDashboard.css matches nothing: no component under `Admin/Users` sets an `active` class.
- Header.css rules no component uses, renamed in 9b so they stop reaching other components: `.site-header-unread-badge`, `.site-header-signout-button`, `.site-header-user-email` (their old names were only ever matched by Menu, Account, UserCard and AdminInbox), plus `.site-header-menu-toggle`, `.site-header-mobile-new-link-old`, `.site-header-new-link`, `.site-header-new-post-label`, `.site-header-signout-icon`, `.site-header-upload-icon` and `.site-header-username`.
- Header.js sets `link`, `menu-icon-adapt` and `menu-div-adapt`, and no stylesheet has a rule for any of them.
- `.conversation-meta .unread-badge` in AdminInbox.css matches nothing: AdminInbox renders its badge as `admin-unread-badge`.
- The comment above AuctionForm's header `div` says Header.css styles the bare `header` element. Since 9b it targets `.site-header`, so AuctionForm could use a `<header>` again.
