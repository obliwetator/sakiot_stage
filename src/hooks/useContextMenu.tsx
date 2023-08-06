import { useState } from 'react';

export default function useContextMenu() {
	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
		file: string | null;
	} | null>(null);

	const handleContextMenu = (event: React.MouseEvent, file: string | null = null) => {
		console.log(event.target as HTMLBaseElement);
		event.preventDefault();
		setContextMenu(
			contextMenu === null
				? {
						mouseX: event.clientX + 2,
						mouseY: event.clientY - 6,
						file: file,
				  }
				: // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
				  // Other native context menus might behave different.
				  // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
				  null
		);
	};

	return [contextMenu, handleContextMenu];
}
