import { usePropertyProxy } from "../src/decorator";
import { PropertyProxy } from "../src/types";

type PickPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>> 

interface Struct {
    name: string;
	isActive: boolean;
	createdAt: Date;
}

type Props = PickPartial<Struct, "createdAt" | "isActive">

type Class<T = any> = new (...args: Props[]) => T;

let MockClass: Class<Struct>;
let proxyMock: PropertyProxy<Struct>;

describe("#Property-Proxy", () => {
	beforeEach(() => {
		const { Property, proxy } = usePropertyProxy<Struct>();

		class Mock implements Struct {
            @Property()
            	name: string;

            @Property()
            	isActive: boolean;

            @Property()
            	createdAt: Date;

            constructor({name, isActive, createdAt}: Props){
            	this.name = name;
            	this.isActive = isActive!;
            	this.createdAt = createdAt!;
            }
		}

		MockClass = Mock;
		proxyMock = proxy;
	});

	it("should return the same values assigned to the constructor", () => {
		const arrange: Struct = {
			name: "interstellar",
			isActive: true,
			createdAt: new Date()
		};

		const sut = new MockClass(arrange);

		expect(sut).toEqual(arrange);
	});

	it("should return the values ​​defined by the proxy setter with all params", () => {
		proxyMock.setName(({setValue, value}) => setValue(`${value}-setted`));
		proxyMock.setIsActive(({setValue}) => setValue(true));
		proxyMock.setCreatedAt(({setValue}) => setValue(new Date()));

		const sut = new MockClass({
			name: "interstellar",
			isActive: false,
			createdAt: new Date()
		});

		expect(sut.name).toBe("interstellar-setted");
		expect(sut.isActive).toBe(true);
		expect(sut.createdAt).toBeInstanceOf(Date);
	});

	it("should return the values ​​defined by the proxy setter without optional params", () => {
		proxyMock.setIsActive(({setValue, value}) => value ? setValue(value) : setValue(true));
		proxyMock.setCreatedAt(({setValue, value}) => value ? setValue(value) : setValue(new Date()));

		const sut = new MockClass({name: "interstellar"}); 

		expect(sut.name).toBe("interstellar");
		expect(sut.isActive).toBe(true);
		expect(sut.createdAt).toBeInstanceOf(Date);
	});

	it("should return the values ​​defined by the proxy getter with all params", () => {
		proxyMock.getName((value) => `${value}-setted`);
		proxyMock.getIsActive(() => true);
		proxyMock.getCreatedAt(() => new Date());

		const sut = new MockClass({
			name: "interstellar",
			isActive: false,
			createdAt: new Date()
		});

		expect(sut.name).toBe("interstellar-setted");
		expect(sut.isActive).toBe(true);
		expect(sut.createdAt).toBeInstanceOf(Date);
	});

	it("should return the values ​​defined by the proxy getter without optional params", () => {
		proxyMock.getIsActive((value) => value ? value : true);
		proxyMock.getCreatedAt((value) => value ? value : new Date());

		const sut = new MockClass({name: "interstellar"}); 

		expect(sut.name).toBe("interstellar");
		expect(sut.isActive).toBe(true);
		expect(sut.createdAt).toBeInstanceOf(Date);
	});
});