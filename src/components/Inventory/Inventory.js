import './Inventory.css';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

const Inventory = ({ posts, onCategorySelect, selectedCategory }) => {
  // Categories with count tracking
  const categories = {
    Beads: 0,
    'Blunt Tips': 0,
    Bubblers: 0,
    Collabs: 0,
    Cups: 0,
    Droppers: 0,
    'Dry Pieces': 0,
    Goblets: 0,
    Jars: 0,
    'Iso Stations': 0,
    Marbles: 0,
    Pendants: 0,
    Recyclers: 0,
    Rigs: 0,
    Slides: 0,
    'Spinner Caps': 0,
    'Terp Pearls': 0,
    Tubes: 0,
    Vases: 0,
    Misc: 0,
  };

  // Per-category totals for regular and discounted prices
  const categoryRegularTotal = Object.keys(categories).reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});
  const categoryDiscountedTotal = Object.keys(categories).reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

  // Overall totals for all items
  let regularTotal = 0;
  let discountedTotal = 0;

  // Sold items totals
  let numSoldItems = 0;
  let soldRegularTotal = 0;
  let soldDiscountedTotal = 0;

  // Loop over posts to calculate totals
  posts.forEach((post) => {
    // Get prices as numbers
    const regularPrice = parseFloat(post.price);
    const effectivePrice = post.discountedPrice ? parseFloat(post.discountedPrice) : regularPrice;

    // Update overall totals
    regularTotal += regularPrice;
    discountedTotal += effectivePrice;

    // Update per-category totals (if category exists)
    if (categories[post.category] !== undefined) {
      categories[post.category]++;
      categoryRegularTotal[post.category] += regularPrice;
      categoryDiscountedTotal[post.category] += effectivePrice;
    }

    // Update sold items totals
    if (post.sold) {
      numSoldItems++;
      soldRegularTotal += regularPrice;
      soldDiscountedTotal += effectivePrice;
    }
  });

  // For sale items totals (unsold items)
  const forSaleRegularTotal = regularTotal - soldRegularTotal;
  const forSaleDiscountedTotal = discountedTotal - soldDiscountedTotal;
  const totalInventoryCount = Object.values(categories).reduce((a, b) => a + b, 0);

  const getColor = (count) => {
    if (count >= 5) return 'rgb(156, 112, 214)';
    switch (count) {
      case 4:
        return 'rgb(129, 129, 255)';
      case 3:
        return 'rgb(0, 163, 63)';
      case 2:
        return 'rgb(216, 209, 0)';
      case 1:
        return 'orange';
      case 0:
        return 'red';
      default:
        return '';
    }
  };

  return (
    <Box
      sx={{
        borderWidth: '1px',
        paddingX: (theme) => theme.spacing(2),
        paddingY: (theme) => theme.spacing(2),
        borderRadius: (theme) => theme.spacing(1),
        gap: (theme) => theme.spacing(2),
      }}
      className="inventory-container"
    >
      <Typography variant="body1">Inventory Totals:</Typography>
      <Table
        className="inventory-table"
        sx={{
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: (theme) => theme.palette.primary.light,
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell component="th" style={{ width: '40%' }}>
              Category
            </TableCell>
            <TableCell component="th" style={{ width: '20%' }}>
              Total Items
            </TableCell>
            <TableCell component="th" style={{ width: '40%' }}>
              Total Price (Discounted)
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(categories).map((category) => (
            <TableRow
              key={category}
              className={selectedCategory === category ? 'selectedRow' : ''}
              onClick={() => onCategorySelect(category)}
            >
              <TableCell
                style={{
                  color: getColor(categories[category]),
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
                onClick={() => onCategorySelect(category)}
              >
                {category}
              </TableCell>
              <TableCell
                style={{
                  color: getColor(categories[category]),
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => onCategorySelect(category)}
              >
                {categories[category]}
              </TableCell>
              <TableCell
                style={{
                  color: getColor(categories[category]),
                  textAlign: 'right',
                  cursor: 'pointer',
                }}
                onClick={() => onCategorySelect(category)}
              >
                ${Number(categoryDiscountedTotal[category].toFixed(0)).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
          {/* Overall totals */}
          <TableRow style={{ fontWeight: 'bold' }}>
            <TableCell style={{ textAlign: 'left' }}>Total Value</TableCell>
            <TableCell style={{ textAlign: 'center' }}>{totalInventoryCount}</TableCell>
            <TableCell style={{ textAlign: 'right' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Regular</span>
                <span>${Number(regularTotal.toFixed(2)).toLocaleString()}</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span> Discount</span>
                <span>${Number(discountedTotal.toFixed(2)).toLocaleString()}</span>
              </Box>
            </TableCell>
          </TableRow>

          {/* Sold items totals */}
          <TableRow style={{ fontWeight: 'bold' }}>
            <TableCell style={{ textAlign: 'left' }}>Sold Items</TableCell>
            <TableCell style={{ textAlign: 'center' }}>{numSoldItems}</TableCell>
            <TableCell style={{ textAlign: 'right' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Regular</span>
                <span>${Number(soldRegularTotal.toFixed(2)).toLocaleString()}</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span> Discount</span>
                <span>${Number(soldDiscountedTotal.toFixed(2)).toLocaleString()}</span>
              </Box>
            </TableCell>
          </TableRow>

          {/* For sale items totals */}
          <TableRow style={{ fontWeight: 'bold' }}>
            <TableCell style={{ textAlign: 'left' }}>For Sale Items</TableCell>
            <TableCell style={{ textAlign: 'center' }}>
              {totalInventoryCount - numSoldItems}
            </TableCell>
            <TableCell style={{ textAlign: 'right' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Regular</span>
                <span>${Number(forSaleRegularTotal.toFixed(2)).toLocaleString()}</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span> Discount</span>
                <span>${Number(forSaleDiscountedTotal.toFixed(2)).toLocaleString()}</span>
              </Box>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
};

export default Inventory;
