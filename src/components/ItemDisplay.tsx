import { Tooltip, Typography } from "@mui/material";
import React, { useState } from 'react';

interface ItemProps {
    name: string;
    amount: number;
    onClick?: (e: React.MouseEvent) => void;
}

const ItemDisplay: React.FC<ItemProps> = ({ name, amount, onClick }) => {
    const [copiedItem, setCopiedItem] = useState<string | null>(null);

    const getImageSrc = (itemName: string) => {
        return `${process.env.PUBLIC_URL}/images/${itemName}.png`;
    };

    const copyToClipboard = (itemName: string) => {
        navigator.clipboard.writeText(itemName).then(() => {
            setCopiedItem(itemName);
            setTimeout(() => setCopiedItem(null), 2000);
        });
    };

    return (
        <Tooltip title={copiedItem === name ? "Copied!" : "Click to copy name"} placement='top' arrow>
            <div 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} 
                onClick={(e) => {
                    if (onClick) onClick(e);
                    copyToClipboard(name);
                }}
            >
                <Typography variant="body1" style={{ userSelect: 'none', marginBottom: 4 }}>{amount}</Typography>
                <img src={getImageSrc(name)} onError={(e) => { e.currentTarget.src = `${process.env.PUBLIC_URL}/images/default.png`; }} alt={name} style={{ userSelect: 'none', height: 100 }} />
                <Typography variant="body1" style={{ userSelect: 'none' }}>{name}</Typography>
            </div>
        </Tooltip>
    );
}

export default ItemDisplay;
