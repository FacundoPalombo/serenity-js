import { Capabilities, ProtractorBrowser } from 'protractor';

/**
 * @private
 */
export class StandardisedCapabilities {
    static of(currentBrowser: () => ProtractorBrowser) {
        return new StandardisedCapabilities(currentBrowser);
    }

    constructor(private currentBrowser: () => ProtractorBrowser) {
    }

    browserName(): PromiseLike<string> {
        return this.get(
            caps => caps.get('browserName'),
        );
    }

    browserVersion(): PromiseLike<string> {
        return this.get(
            caps => caps.get('version'),
            caps => caps.get('browserVersion'),
            caps => caps.has('deviceManufacturer') && caps.has('deviceModel')
                ? `${ caps.get('deviceManufacturer') } ${ caps.get('deviceModel') }`
                : undefined,
            caps => caps.has('mobile') && caps.get('mobile').version,
        );
    }

    platformName(): PromiseLike<string> {
        return this.get(
            caps => (caps.has('platformName') && ! /any/i.test(caps.get('platformName')))
                ? caps.get('platformName')
                : caps.get('platform'),
        );
    }

    platformVersion(): PromiseLike<string> {
        return this.get(
            caps => caps.get('platformVersion'),
        );
    }

    private get(...fetchers: Array<(capabilities: Capabilities) => string>): PromiseLike<string> {
        return this.currentBrowser().getCapabilities().then(caps => {
            for (const fetcher of fetchers) {
                const result = fetcher(caps);
                if (!! result) {
                    return result;
                }
            }
            return undefined;
        });
    }
}
