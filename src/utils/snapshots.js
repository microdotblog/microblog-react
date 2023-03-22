import SFInfo from 'react-native-sensitive-info'
import { onSnapshot } from 'mobx-state-tree';
import AsyncStorage from "@react-native-async-storage/async-storage";

import Tokens from './../stores/Tokens';
import Auth from './../stores/Auth';
import Settings from './../stores/Settings';

function debounce(func, wait) {
	let timeout
	return function (...args) {
		const context = this
		clearTimeout(timeout)
		timeout = setTimeout(() => func.apply(context, args), wait)
	}
}

const debounce_ms = 1500

onSnapshot(Tokens, snapshot => { SFInfo.setItem('Tokens', JSON.stringify(snapshot), {}), console.log("SNAPSHOT:::TOKENS") });
onSnapshot(Auth, debounce(
	snapshot => {
		AsyncStorage.setItem('Auth', JSON.stringify(snapshot));
		console.log("SNAPSHOT:::AUTH")
	}, debounce_ms ))
onSnapshot(Settings, snapshot => { AsyncStorage.setItem('Settings', JSON.stringify(snapshot)), console.log("SNAPSHOT:::SETTINGS") });